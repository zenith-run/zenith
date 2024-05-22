<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';
	import SvelteMarkdown from 'svelte-markdown';
	import type { HTMLAttributes } from 'svelte/elements';
	import { titleize } from '$lib/components/ui/canvas/helpers/titleize';

	type $$Props = HTMLAttributes<HTMLDivElement> & {
		tip?: string;
		title: string;
	};

	let className: $$Props['class'] = undefined;
	export let tip: $$Props['tip'] = undefined;
	export let title: $$Props['title'];
	export { className as class };
</script>

<header class={cn('border-b-2', className)}>
	<Tooltip.Root portal={null}>
		<Tooltip.Trigger class="w-full">
			<h1>{titleize(title)}</h1>
		</Tooltip.Trigger>
		{#if tip}
			<div class="text-center">
				<Tooltip.Content align="center" side="top" sideOffset={10}>
					<SvelteMarkdown source={tip} />
				</Tooltip.Content>
			</div>
		{/if}
	</Tooltip.Root>
</header>

<style lang="postcss">
	h1 {
		@apply text-foreground font-semibold;
		@apply px-4 pb-1.5 pt-2.5;
		@apply cursor-grab;
		@apply inline-block w-full text-left;
	}
</style>
