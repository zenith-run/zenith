import { mode as themeMode } from 'mode-watcher';
import { get } from 'svelte/store';
import type { CSSColorString } from 'svelvet';

export type ParamTypes = 'string' | 'boolean' | 'number' | 'array' | 'unknown';
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

export function getEdgeColorForType(type: ParamTypes): CSSColorString {
	let edgeColor: CSSColorString;

	let themeSet = get(themeMode) ?? 'dark';
	const themeShades = PARAM_COLORS[themeSet];
	edgeColor = themeShades[type] ?? themeShades.unknown;
	return edgeColor;
}
