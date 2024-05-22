<script lang="ts">
	import type { CSSColorString } from 'svelvet';
	import { getEdgeColorForType, type ParamTypes } from '$lib/components/ui/canvas/helpers/colors';
	import BaseAnchor from './base-anchor.svelte';

	export let origin: { node: string; anchor: string };

	let [type, direction] = origin.anchor.split('-');
	let input = direction === 'out'; // inverse of the origin direction.

	let edgeColor: CSSColorString | undefined = undefined;
	if (!origin.anchor.startsWith('port')) {
		edgeColor = getEdgeColorForType(type as ParamTypes);
	}
</script>

<div class="absolute top-[50%] -z-10" class:right-0={!input}>
	<BaseAnchor
		id="bootstrap"
		connections={[[origin.node, origin.anchor]]}
		{edgeColor}
		{input}
		output={!input}
		multiple={false}
	/>
</div>
