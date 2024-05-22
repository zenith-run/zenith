<script lang="ts">
	import { Node } from 'svelvet';
	import { updateNodePosition } from '$lib/components/ui/canvas/graph-store';
	import { debounce } from 'ts-debounce';

	let position: { x: number; y: number };
	let id: string;

	const delayedPositionUpdate = debounce(updateNodePosition, 100);
	$: delayedPositionUpdate(id, position);
</script>

<Node {...$$restProps} editable={false} let:selected bind:position bind:id>
	<div class="node-wrapper">
		<div class="node" class:selected>
			<slot {selected} {id} />
		</div>
	</div>
</Node>

<style lang="postcss">
	.node-wrapper {
		@apply backdrop-blur-sm;
	}
	.node {
		@apply overflow-clip rounded-xl;
		@apply bg-background opacity-80;
	}
	.node.selected {
		@apply outline outline-yellow-600;
	}
</style>
