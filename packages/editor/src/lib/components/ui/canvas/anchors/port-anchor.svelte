<script lang="ts">
	import { mode as themeMode } from 'mode-watcher';
	import BaseAnchor from './base-anchor.svelte';
	import { newRandomId } from '$lib/components/ui/canvas/helpers/id';
	import type { PortSpec } from '@zenith-run/core/component';
	import AnchorLabel from './anchor-label.svelte';

	export let label: string | undefined = undefined;
	export let direction: 'in' | 'out';
	export let definition: PortSpec | undefined = undefined;

	let input = direction === 'in';
	let output = !input;
	let id = `port-${direction}-${newRandomId()}`;
	let { doc } = definition ?? {};
</script>

<BaseAnchor {...$$restProps} {input} {output} {id} {doc} let:linked>
	<div class="port-anchor" class:input>
		<AnchorLabel {label} definable={definition} />
		<!-- svelte-ignore a11y-missing-attribute -->
		<div class="img-wrapper">
			<img
				src={linked
					? `/svg/${$themeMode}/port-arrow-filled.svg`
					: `/svg/${$themeMode}/port-arrow.svg`}
			/>
			<!-- for some reason this eliminates a spacing bug when reversed -->
		</div>
		<div />
	</div>
</BaseAnchor>

<style lang="postcss">
	.port-anchor {
		@apply flex items-center;
	}
	.input {
		@apply flex-row-reverse;
	}
	img,
	.img-wrapper {
		@apply inline-block;
		width: 40px;
	}
</style>
