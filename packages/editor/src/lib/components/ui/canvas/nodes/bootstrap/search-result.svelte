<script lang="ts" context="module">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Definable } from '@zenith-run/core/component';

	export type SearchResult = Definable & {};
</script>

<script lang="ts">
	export let result: SearchResult | undefined;
	export let selected = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
	class="flex items-center p-1.5 cursor-pointer"
	class:cursor-wait={!result}
	class:selected
	on:click
	on:mouseover
>
	<div class="space-y-1 m-1">
		{#if result}
			<h1>{result.label}</h1>
			<p>{result.doc}</p>
		{:else}
			<Skeleton class="h-4 w-[300px] opacity-80" />
			<Skeleton class="h-4 w-[230px] opacity-80" />
		{/if}
	</div>
</div>

<style lang="postcss">
	h1 {
		@apply text-foreground font-semibold;
	}
	p {
		@apply text-muted-foreground;
	}
	.selected {
		@apply bg-muted;
	}
</style>
