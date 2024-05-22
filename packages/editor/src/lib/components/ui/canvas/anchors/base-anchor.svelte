<script lang="ts">
	import { Anchor, type CSSColorString } from 'svelvet';
	import Edge from './edge.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import SvelteMarkdown from 'svelte-markdown';

	export let edgeColor: CSSColorString | undefined = undefined;
	export let id: string;
	export let doc: string | undefined = undefined;

	let side: 'left' | 'right' = $$props.input ? 'left' : 'right';
	let baseAnchor: HTMLDivElement;
</script>

<Anchor {...$$restProps} let:linked {id}>
	<Edge slot="edge" color={edgeColor} />
	<Tooltip.Root portal={null}>
		<Tooltip.Trigger>
			<div class="base-anchor" bind:this={baseAnchor}>
				<slot {linked} />
			</div>
			{#if doc}
				<div class="w-max" class:text-left={side === 'right'} class:text-right={side === 'left'}>
					<Tooltip.Content
						collisionBoundary={baseAnchor}
						avoidCollisions={false}
						align="end"
						{side}
						sideOffset={10}
					>
						<SvelteMarkdown source={doc} />
					</Tooltip.Content>
				</div>
			{/if}
		</Tooltip.Trigger>
	</Tooltip.Root>
</Anchor>

<style lang="postcss">
	.base-anchor {
		@apply cursor-crosshair;
		@apply text-nowrap;
	}
</style>
