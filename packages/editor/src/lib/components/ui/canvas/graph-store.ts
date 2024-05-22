import type { SvelteComponent, ComponentProps } from 'svelte';
import { type Writable, writable } from 'svelte/store';

// All nodes in the graph must have these props at a mininum to be managed.
export type BaseNodeProps<T extends SvelteComponent> = ComponentProps<T> & {
	id: string;
	position: { x: number; y: number };
};

// Each graph node is a component of a certain type with specific props.
// This type manages a record of them. NOTE: the position must be kept in sync
// with what is being rendered to prevent rubber banding.
export type GraphNode<T extends SvelteComponent> = {
	type: T;
	props: BaseNodeProps<T>;
};

// Here we keep a canonical accounting of the nodes in the graph. This must be kept in sync with the graph.
// which has it's own accounting of the *rendered* nodes. This allows descendants to modify the records
// stored by the manager.
export type GraphNodeStore = Writable<Map<string, GraphNode<any>>>;
export const graphNodes: GraphNodeStore = writable(new Map());

/**
 * updateNodePosition relays the latest position information for the node to the parent graph manager.
 *  Debounce is used here to prevent unncessary updates to the store.
 */
export function updateNodePosition(nodeId: string, position: { x: number; y: number }) {
	graphNodes.update((nodes) => {
		const node = nodes.get(nodeId);
		if (!node) return nodes;
		console.log(`Updating node ${nodeId} position to (x=${position.x}, y=${position.y})`);
		node.props.position = position;
		return nodes.set(nodeId, node);
	});
}
