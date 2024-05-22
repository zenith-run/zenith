<script lang="ts" context="module">
	import type { CSSColorString } from 'svelvet';

	export const PARAM_TYPES = ['string', 'boolean', 'number', 'array', 'unknown'] as const;
	type ParamTypes = (typeof PARAM_TYPES)[number];
	type ColorSet = {
		[key in 'light' | 'dark']: {
			[key in ParamTypes]: CSSColorString;
		};
	};

	const PARAM_COLORS: ColorSet = {
		light: {
			string: '#F5A623',
			boolean: '#4A90E2',
			number: '#7ED321',
			array: '#50E3C2',
			unknown: '#9B9B9B'
		},
		dark: {
			string: '#F5A623',
			boolean: '#4A90E2',
			number: '#7ED321',
			array: '#50E3C2',
			unknown: '#9B9B9B'
		}
	};
</script>

<script lang="ts">
	import BaseAnchor from './base-anchor.svelte';
	import { newRandomId } from '../helpers/id';
	import type { ParameterSpec } from '@zenith-run/core/component';
	import AnchorLabel from './anchor-label.svelte';
	import { getEdgeColorForType } from '../helpers/colors';

	export let label: string;
	export let direction: 'in' | 'out';
	export let definition: ParameterSpec;

	let input = direction === 'in';
	let output = !input;
	let type = (definition.type.type ?? 'unknown') as unknown as ParamTypes;
	let id = `${type}-${direction}-${newRandomId()}`;

	// Prepend type information.
	let { doc: originalDoc } = definition;
	let doc = `**(${type}):** ${originalDoc}`;
	let edgeColor = getEdgeColorForType(type);
</script>

<BaseAnchor {...$$restProps} {input} {output} {edgeColor} {id} {doc} let:linked>
	{@const fillColor = linked ? edgeColor : 'transparent'}
	<div class="param-anchor" class:input class:type>
		<AnchorLabel {label} definable={definition} />
		<div class="svg-wrapper">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<circle cx="12" cy="12" r="4" stroke={edgeColor} stroke-width="1" fill={fillColor} />
			</svg>
		</div>
	</div>
</BaseAnchor>

<style lang="postcss">
	.param-anchor {
		@apply flex items-center;
	}
	.input {
		@apply flex-row-reverse;
	}
	svg,
	.svg-wrapper {
		@apply inline-block;
		width: 40px;
	}
</style>
