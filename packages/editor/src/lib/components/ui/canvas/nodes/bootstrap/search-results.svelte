<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SearchResult as Result } from './search-result.svelte';
	import SearchResult from './search-result.svelte';

	export let results: Result[] = [];
	export let selectedIndex = 0;

	const dispatch = createEventDispatcher();

	export function select() {
		dispatch('select', results[selectedIndex]);
	}

	function onResultClick(index: number) {
		return function (event: MouseEvent) {
			event.stopPropagation();
			selectedIndex = index;
			select();
		};
	}

	function onResultHover(index: number) {
		return function (event: MouseEvent) {
			event.stopPropagation();
			selectedIndex = index;
		};
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<section id="search-results">
	{#if results && results.length > 0}
		<div id="inner" on:wheel|stopPropagation>
			{#each results as result, index (index)}
				<SearchResult
					{result}
					selected={result === results[selectedIndex]}
					on:click={onResultClick(index)}
					on:mouseover={onResultHover(index)}
				/>
			{/each}
		</div>
	{/if}
</section>

<style lang="postcss">
	#search-results {
		@apply bg-background;
	}
	#inner {
		@apply border-input flex flex-col rounded-md border-2;
		@apply max-h-64 overflow-y-auto;
		@apply scrollbar scrollbar-w-1.5 scrollbar-thumb-muted-foreground scrollbar-track-transparent scrollbar-thumb-rounded-sm;
	}
</style>
