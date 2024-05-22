<script lang="ts">
	import type { ComponentSpec, Definable } from '@zenith-run/core/component';
	import { PortAnchor, ParamAnchor } from '$lib/components/ui/canvas/anchors';
	import { BaseNode, NodeHeader } from '$lib/components/ui/canvas/nodes';
	import type { ComponentType } from 'svelte';

	export let component: ComponentSpec;
	export let label: string | undefined = undefined;

	// These are standard ports that are always present on a component.
	let { completionPort, executionPort } = component?.ports?.options ?? {};
	let title = component?.label ?? label ?? '';

	function anchorsFor(direction: 'in' | 'out') {
		const ports = component?.ports ?? {};
		const parameters = component?.parameters ?? {};

		function anchors(definitions: Record<string, Definable>, element: ComponentType) {
			return Object.entries(definitions).map(([label, definition]) => ({
				element,
				label,
				definition,
				direction
			}));
		}

		const portAnchors = (key: 'inlets' | 'outlets') => anchors(ports[key] ?? {}, PortAnchor);
		const paramAnchors = (key: 'inputs' | 'outputs') => anchors(parameters[key] ?? {}, ParamAnchor);

		switch (direction) {
			case 'in':
				return [...portAnchors('inlets'), ...paramAnchors('inputs')];
			case 'out':
				return [...portAnchors('outlets'), ...paramAnchors('outputs')];
		}
	}
</script>

<BaseNode {...$$restProps}>
	<div class="component-node">
		<NodeHeader {title} tip={component.doc} class="bg-sky-500 border-sky-800" />
		<div class="body">
			<div class="start">
				<PortAnchor direction="in" definition={executionPort} />
				{#each anchorsFor('in') as { element, ...props }, index (index)}
					<svelte:component this={element} {...props} />
				{/each}
			</div>
			<div class="end">
				{#if !completionPort?.hide}
					<PortAnchor direction="out" definition={completionPort} />
				{/if}
				{#each anchorsFor('out') as { element, ...props }, index (index)}
					<svelte:component this={element} {...props} />
				{/each}
			</div>
		</div>
	</div>
</BaseNode>

<style lang="postcss">
	.body {
		@apply flex p-1;
	}
	.start,
	.end {
		@apply grid auto-rows-max;
	}
	.end {
		@apply ml-6;
		@apply place-items-end;
	}
</style>
