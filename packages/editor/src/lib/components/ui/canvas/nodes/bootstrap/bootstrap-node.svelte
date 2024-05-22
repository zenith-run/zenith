<script lang="ts" context="module">
	export enum BootstrapCategory {
		COMPONENT = 'Component',
		VARIABLE = 'Variable',
		FUNCTION = 'Function',
		TRIGGER = 'Trigger'
	}
</script>

<script lang="ts">
	import { BaseNode } from '$lib/components/ui/canvas/nodes';
	import { Input } from '$lib/components/ui/input';
	import { BootstrapAnchor } from '$lib/components/ui/canvas/anchors';
	import { getContext } from 'svelte';
	import type { GraphManagerController } from '$lib/components/ui/canvas/graph-manager.svelte';
	import SearchResults from './search-results.svelte';
	import { searchComponents } from '$lib/components/search';
	import type { SearchResult } from './search-result.svelte';
	import { debounce } from 'ts-debounce';
	import type { ComponentSpec } from '@zenith-run/core/component';
	import NodeHeader from '$lib/components/ui/canvas/nodes/node-header.svelte';

	export let origin: { node: string; anchor: string } | undefined;
	export let category: BootstrapCategory = BootstrapCategory.COMPONENT;

	const graphManager = getContext<GraphManagerController>('graphManager');

	let query = '';
	let results: SearchResult[];
	let selectedIndex = 0;
	let searchResults: SearchResults;

	// Captures hot keys for quick navigation within the node's search box.
	function detectHotkeys(nodeId: string) {
		return function (event: KeyboardEvent) {
			switch (event.key) {
				case 'Escape':
					graphManager.deleteNodes([nodeId]);
					break;
				case 'Enter':
					searchResults.select();
					break;
				case 'ArrowUp':
					event.preventDefault();
					selectedIndex = Math.max(0, selectedIndex - 1);
					break;
				case 'ArrowDown':
					event.preventDefault();
					selectedIndex = Math.min(results.length - 1, selectedIndex + 1);
					break;
			}
		};
	}

	// Handles the selection of a search result, and the creation of a new node.
	function onSelectResult(nodeId: string) {
		return async function ({ detail }: CustomEvent<SearchResult>) {
			if (!detail) return;
			switch (category) {
				case BootstrapCategory.COMPONENT:
					const component = detail as ComponentSpec;
					graphManager.replaceBootstrapNode(nodeId, { component, props: {} }, origin);
					break;
				case BootstrapCategory.VARIABLE:
					break;
				case BootstrapCategory.FUNCTION:
					break;
				case BootstrapCategory.TRIGGER:
					break;
			}
		};
	}

	// Performs a search for the given query.
	async function search(query: string) {
		switch (category) {
			case BootstrapCategory.COMPONENT:
				const response = await searchComponents({ query });
				results = response.results;
				break;
			case BootstrapCategory.VARIABLE:
				break;
			case BootstrapCategory.FUNCTION:
				break;
			case BootstrapCategory.TRIGGER:
				break;
		}
		selectedIndex = 0;
	}

	// Debounce the search function so we don't spam the server.
	const debouncedSearch = debounce(search, 100);
	$: if (query) debouncedSearch(query);

	// This causes the skeletons to show while we're loading.
	$: if (query.length >= 1) results = Array(2);
</script>

<BaseNode {...$$restProps} let:id>
	<NodeHeader title="Add {category}" class="bg-gray-700 border-gray-900" />
	{#if origin}
		{#key results}
			<BootstrapAnchor {origin} />
		{/key}
	{/if}
	<div class="bootstrap-node flex-col space-y-2">
		<Input
			focus={true}
			type="text"
			placeholder="Search..."
			bind:value={query}
			on:keydown={detectHotkeys(id)}
		/>
		{#if results && results.length > 0}
			<SearchResults
				bind:results
				bind:selectedIndex
				on:select={onSelectResult(id)}
				bind:this={searchResults}
			/>
		{/if}
	</div>
</BaseNode>

<style lang="postcss">
	.bootstrap-node {
		@apply p-2.5;
		@apply w-96;
	}
</style>
