<script lang="ts">
	import { mode as themeMode } from 'mode-watcher';
	import { Svelvet, type SvelvetConnectionEvent } from 'svelvet';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import GraphManager from './graph-manager.svelte';
	import type { CustomEventHandler } from 'bits-ui';
	import { tick } from 'svelte';
	import { BootstrapCategory } from './nodes/bootstrap/bootstrap-node.svelte';
	import { PARAM_TYPES } from './anchors/param-anchor.svelte';

	let graphManager: GraphManager;

	// Delete whatever nodes are currently selected.
	function handleKey(event: KeyboardEvent) {
		switch (event.key) {
			case 'Delete':
				graphManager.deleteSelectedNodes();
				break;
		}
	}

	// When a node connects to another, we verify the edige is valid.
	async function onConnection({ detail }: CustomEvent<SvelvetConnectionEvent>) {
		const {
			sourceAnchor: { id: source },
			targetAnchor: { id: target }
		} = detail;
		// Ignore bootstrap node, it's fake and can be connected to anything.
		if (source.startsWith('A-bootstrap')) return;

		// allow the connection to be made, then check if it's valid.
		await tick();
		if (!graphManager.isValidEdge(source, target)) {
			graphManager.disconnectEdge(source, target);
		}
	}

	// When an edge is dropped, we spawn a new bootstrap node for that contextual anchor.
	function onEdgeDrop({
		detail: {
			cursor: { x, y },
			source
		}
	}: CustomEvent<{ cursor: { x: number; y: number }; source: { node: string; anchor: string } }>) {
		let category = BootstrapCategory.COMPONENT;
		for (const paramType of PARAM_TYPES) {
			if (source.anchor.startsWith(paramType)) {
				category = BootstrapCategory.FUNCTION;
				break;
			}
		}
		graphManager.addBootstrapNode({ position: { x, y }, category }, source);
	}

	const addComponentNode = bootstrapNodeFor(BootstrapCategory.COMPONENT);
	const addVariableNode = bootstrapNodeFor(BootstrapCategory.VARIABLE);
	const addFunctionNode = bootstrapNodeFor(BootstrapCategory.FUNCTION);
	const addTriggerNode = bootstrapNodeFor(BootstrapCategory.TRIGGER);

	// Genertic wrapper for adding a bootstrap node.
	function bootstrapNodeFor(category: BootstrapCategory) {
		return contextClick(function (event: PointerEvent) {
			graphManager.addBootstrapNode({
				position: { x: event.clientX, y: event.clientY },
				category
			});
		});
	}

	// This fixes some deranged type system issues with bits-ui.
	function contextClick(fn: (event: PointerEvent) => void) {
		return (event: CustomEventHandler<MouseEvent, HTMLDivElement>) => {
			const detail = event.detail as unknown as { originalEvent: PointerEvent };
			fn(detail.originalEvent);
		};
	}
</script>

<ContextMenu.Root>
	<ContextMenu.Content>
		<ContextMenu.Item on:click={addComponentNode}>Add Component...</ContextMenu.Item>
		<ContextMenu.Item on:click={addFunctionNode}>Add Function...</ContextMenu.Item>
		<ContextMenu.Item on:click={addVariableNode}>Add Variable...</ContextMenu.Item>
		<ContextMenu.Item on:click={addTriggerNode}>Add Trigger...</ContextMenu.Item>
	</ContextMenu.Content>
	<ContextMenu.Trigger class="h-screen">
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<section on:keyup|preventDefault={handleKey} class="h-screen">
			<header class="z-20 absolute"><slot /></header>
			<Svelvet
				theme={$themeMode}
				minimap
				controls
				on:connection={onConnection}
				on:edgeDrop={onEdgeDrop}
			>
				<GraphManager bind:this={graphManager} />
			</Svelvet>
		</section>
	</ContextMenu.Trigger>
</ContextMenu.Root>

<style lang="postcss">
	:root[svelvet-theme='dark'] {
		--background-color: theme('colors.muted.DEFAULT');
		--controls-background-color: theme('colors.secondary.DEFAULT');
	}
</style>
