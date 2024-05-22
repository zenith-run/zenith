<script lang="ts" context="module">
	export type GraphManagerController = {
		deleteNodes: (nodes: Node[] | string[]) => Promise<void>;
		replaceBootstrapNode: (
			bootstrapNodeId: string,
			component: { component: ComponentSpec; props: Omit<BaseNodeProps<ComponentNode>, 'id'> },
			origin: { node: string; anchor: string } | undefined
		) => Promise<void>;
	};
</script>

<script lang="ts">
	import {
		getContext,
		type ComponentProps,
		SvelteComponent,
		type ComponentType,
		tick,
		setContext
	} from 'svelte';
	import { Anchor, type Graph, type Node, type WritableEdge } from 'svelvet';
	import { ComponentNode, BootstrapNode } from './nodes';
	import { calculateRelativePosition } from './helpers/position';
	import { graphNodes, type BaseNodeProps } from './graph-store';
	import { get, writable } from 'svelte/store';
	import { newRandomId } from './helpers/id';
	import type { ComponentSpec } from '@zenith-run/core/component';

	// This graph is the rendered graph. It's the one that's actually displayed on the screen
	// and comes to us from the Svelvet component in canvas.svelte.
	const graph = getContext<Graph>('graph');

	// This delegate is used to expose the graph manager capabilities to svelte components
	// that are rendered within the graph.
	const controller: GraphManagerController = {
		deleteNodes,
		replaceBootstrapNode
	};
	setContext('graphManager', controller);

	/**
	 * Adds a component node to the graph.
	 * @param props The props to pass to {@link ComponentNode}.
	 */
	export async function addComponentNode(
		component: ComponentSpec,
		props: Omit<BaseNodeProps<ComponentNode>, 'id'>
	): Promise<string> {
		// Adjusts to whatever the view port is truly pointing at, plus some
		// additional offset to make it look nice.
		props.position = adjustPositionOffset(props.position);
		const nodeId = await addGraphNode(ComponentNode, { ...props, component });
		exclusivelySelectNode(nodeId);
		return nodeId;
	}

	/**
	 * Adds a bootstrap node to the graph.
	 * @param props The props to pass to {@link BootstrapNode}.
	 */
	export async function addBootstrapNode(
		props: Omit<BaseNodeProps<BootstrapNode>, 'id'>,
		origin: { node: string; anchor: string } | undefined = undefined
	) {
		deselectAllNodes();
		const nodeId = await addGraphNode(BootstrapNode, { ...props, origin });
		exclusivelySelectNode(nodeId);
	}

	/**
	 * Replaces the bootstrap node with a different one.
	 * @param bootstrapNodeId The ID of the bootstrap node to replace.
	 * @param context The type to replace the bootstrap node with.
	 * @param origin Optional. The origin node and anchor to connect the new node to.
	 */
	export async function replaceBootstrapNode(
		bootstrapNodeId: string,
		{
			component,
			props
		}: { component: ComponentSpec; props: Omit<BaseNodeProps<ComponentNode>, 'id'> },
		origin: { node: string; anchor: string } | undefined = undefined
	) {
		// TODO(perezd): This will need to be aware of the other possible node types.
		const {
			props: { position }
		} = get(graphNodes).get(bootstrapNodeId)!;

		// Gate on all the things we need to do to replace the bootstrap node
		// before we connect the new node to the origin (if present.)
		const steps = [
			deleteNodes([bootstrapNodeId]),
			addComponentNode(component, { ...props, position })
		];

		if (!origin) return;

		// Wait for all the nodes to settle, then begin connecting
		// the new node to the origin.
		const [, nodeId] = await Promise.all(steps);
		const newNode = get(graph.nodes).get(`N-${nodeId}`);
		if (!newNode) throw new Error(`Node not found (ID=${nodeId}).`);

		// Find the origin port within the origin node.
		const sourceNode = get(graph.nodes).get(`N-${origin.node}`);
		if (!sourceNode) throw new Error(`Origin node not found (ID=${origin.node}).`);
		const sourcePort = sourceNode.anchors.get(`A-${origin.anchor}/N-${origin.node}`);
		if (!sourcePort) throw new Error(`Origin port not found (ID=${origin.anchor}).`);

		// The first port is always the execution or completion port, depending on direction.
		const targetDirection = sourcePort.id.startsWith('A-port-out') ? 'in' : 'out';
		const targetPort = newNode.anchors
			.getAll()
			.find(({ id }) => id.startsWith(`A-port-${targetDirection}`));
		if (!targetPort) throw new Error(`Execution port not found (ID=${nodeId}).`);

		// Finally, declare the edge between the two ports..
		const edge: WritableEdge = {
			id: `${sourcePort.id}+${targetPort.id}`,
			source: sourcePort,
			target: targetPort,
			type: writable(null),
			color: sourcePort.edgeColor,
			width: writable(0),
			animated: writable(true),
			component: null,
			rendered: writable(false),
			start: null,
			end: null
		};
		graph.edges.add(edge, new Set([sourcePort, targetPort]));
		await tick();
	}

	/**
	 * Deletes all selected nodes from the graph.
	 */
	export function deleteSelectedNodes() {
		deleteNodes(selectedNodes());
	}

	/**
	 * Deletes all the nodes from the graph manager and DOM that are provdied.
	 * @param nodes an array of nodes to delete.
	 */
	export async function deleteNodes(nodes: Node[] | string[]) {
		if (nodes.length === 0) return;

		// We have to update both the store and the canvas graph.
		// This happens with the minimal number of DOM updates by using two update calls.
		graphNodes.update((graphNodes) => {
			graph.nodes.update((canvasGraphNodes) => {
				for (const node of nodes) {
					if (!node) continue;

					const nodeId = (typeof node === 'string'
						? `N-${node}`
						: node.id) as unknown as `N-${string}`;
					const canvasNode = canvasGraphNodes.get(nodeId)!;

					// We may have to delete more than just the node provided,
					// based on its anchors.
					const nodesToDelete = new Set<string>();
					nodesToDelete.add(nodeId);

					// Determine if there are any bootstrap nodes attached
					// that should be cleaned up as a result of deleting the
					// node in question.
					for (const result of graph.edges.match(canvasNode)) {
						const [{ id: targetAnchorId }, , { id: siblingNodeId }] = result as unknown as [
							Anchor,
							never,
							Node
						];
						if (targetAnchorId.startsWith('A-bootstrap')) {
							nodesToDelete.add(siblingNodeId);
						}
					}

					console.log('Deleting nodes:', nodesToDelete);
					for (const nodeId of nodesToDelete) {
						// we slice of the N- prefix here because the store doesn't use it.
						if (!graphNodes.delete(nodeId.slice(2))) {
							throw new Error(`Delete node failed (ID=${nodeId}). (store)`);
						}
						if (!canvasGraphNodes.delete(nodeId as unknown as `N-${string}`)) {
							throw new Error(`Delete node failed (ID=${nodeId}). (canvas)`);
						}
					}
				}
				return canvasGraphNodes;
			});
			return graphNodes;
		});
		await tick();
	}

	/**
	 * Deselects all the currently selected nodes in the graph.
	 */
	export async function deselectAllNodes() {
		graph.groups.update((groups) => {
			groups.selected.nodes.update((nodes) => {
				nodes.clear();
				return nodes;
			});
			return groups;
		});
		await tick();
	}

	/**
	 * isValidEdge takes a source and target key and returns whether or not an edge between them is
	 * considered valid. These are the rules:
	 * - The source and target keys must not be the same.
	 * - The source and target keys must have a common prefix (this is a classification trick).
	 * @param sourceKey The key of the source anchor, formatted in svelet's anchor key format (eg: A-{string}/N-{string}).
	 * @param targetKey The key of the target anchor, formatted in svelet's anchor key format (eg: A-{string}/N-{string}).
	 */
	export function isValidEdge(sourceKey: string, targetKey: string): boolean {
		return sourceKey !== targetKey && longestOffsetPrefix(sourceKey, targetKey) > 0;
	}

	/**
	 * disconnectEdge takes a source and target key and disconnects the edge between them.
	 * @param sourceKey The key of the source anchor, formatted in svelet's anchor key format (eg: A-{string}/N-{string}).
	 * @param targetKey The key of the target anchor, formatted in svelet's anchor key format (eg: A-{string}/N-{string}).
	 */
	export async function disconnectEdge(sourceKey: string, targetKey: string) {
		const source = sourceKey.split('/');
		const target = targetKey.split('/');

		// This is gross, and largely copied from here:
		// https://github.com/open-source-labs/Svelvet/blob/7ba45fdb4bfd349b4f536f61156ff66c76542f8a/src/lib/containers/Svelvet/Svelvet.svelte#L160
		// Reason being, it's impossible (?) to get access to the requisite types to do this in a non-procedural way,
		// given how this project is curently structured.

		const sourceNode = graph.nodes.get(source[1] as unknown as `N-${string}`);
		if (!sourceNode) throw Error('Source node not found.');
		const sourceAnchor = sourceNode.anchors.get(sourceKey as unknown as `A-${string}/N-${string}`);
		if (!sourceAnchor) throw Error('Source anchor not found.');

		const targetNode = graph.nodes.get(target[1] as unknown as `N-${string}`);
		if (!targetNode) throw Error('Target node not found.');
		const targetAnchor = targetNode.anchors.get(targetKey as unknown as `A-${string}/N-${string}`);
		if (!targetAnchor) throw Error('Target anchor not found.');

		const edgeKey = graph.edges.match(sourceAnchor, targetAnchor);
		if (!edgeKey) throw Error('Edge not found.');
		graph.edges.delete(edgeKey[0]);
		await tick();
	}

	async function addGraphNode<T extends SvelteComponent>(
		type: ComponentType<T>,
		props: ComponentProps<T>
	): Promise<string> {
		if (!props.position) {
			throw new Error('Position is required to add a node to the graph.');
		}

		graphNodes.update((graphNodes) => {
			props.id = newRandomId();
			graphNodes.set(props.id, { type, props });
			console.log(`Adding node ${props.id}`);
			return graphNodes;
		});
		await tick();
		return props.id;
	}

	async function exclusivelySelectNode(nodeId: string) {
		let node = get(graph.nodes).get(`N-${nodeId}`);
		if (!node) return Promise.resolve();
		get(graph.groups).selected.nodes.update((nodes) => {
			nodes.clear();
			nodes.add(node!);
			return nodes;
		});
		await tick();
		return;
	}

	function selectedNodes(): Node[] {
		const nodes = get(get(graph.groups).selected.nodes);
		return Array.from(nodes).filter((node) => 'id' in node) as unknown as Node[];
	}

	// This is finding the longest prefix offset at position 2 because
	// svelvet keys are all prefixed with A- or N- etc. Not very resuable,
	// but should be discrete enough to not cause any issues.
	function longestOffsetPrefix(a: string, b: string): number {
		let i = 2;
		while (a[i] === b[i]) i++;
		return i - 2;
	}

	function adjustPositionOffset(position: { x: number; y: number }): { x: number; y: number } {
		return calculateRelativePosition(graph.dimensions, graph.transforms, position).scaled;
	}
</script>

{#each $graphNodes.values() as { type, props } (props.id)}
	<svelte:component this={type} {...props} />
{/each}
