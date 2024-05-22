<script lang="ts">
	import type { Definable } from '@zenith-run/core/component';
	import { titleize } from '$lib/components/ui/canvas/helpers/titleize';

	export let label: string | undefined = undefined;
	export let definable: Definable | undefined = undefined;

	let renderedLabel = titleize(definable?.label ?? label ?? '');
</script>

<span>{renderedLabel}</span>

<style lang="postcss">
	span {
		@apply text-foreground;
	}
</style>
