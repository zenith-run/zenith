<script lang="ts">
	import { Edge, type CSSColorString } from 'svelvet';
	import { mode as themeMode } from 'mode-watcher';

	export let color: CSSColorString | undefined = undefined;
	$: if (!color) color = $themeMode === 'light' ? 'black' : 'white';
</script>

<Edge let:path>
	<path stroke-width="2px" stroke={color} d={path} />
</Edge>
