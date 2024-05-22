/*
This was copied from the svelvet repo's util folder. It was copied here due to
lack of accessibility from the library itself.

Commit:
https://raw.githubusercontent.com/open-source-labs/Svelvet/7e30eb14ad8c371c0423086009354d1f7c8038cf/src/lib/utils/calculators/calculateRelativeCursor.ts
*/
import { get } from 'svelte/store';
import type { Graph } from 'svelvet';

export const calculateRelativeCursor = (
	e: { clientX: number; clientY: number },
	top: number,
	left: number,
	width: number,
	height: number,
	scale: number,
	translation: { x: number; y: number }
) => {
	const { clientX, clientY } = e;
	const scaleCapture = scale;

	const xRelativeToWrapper = clientX - left;
	const yRelativeToWrapper = clientY - top;

	const xOffsetDueToTranslation = translation.x;
	const yOffsetDueToTranslation = translation.y;

	const xOffsetDuetToScale = (width * (1 - scale)) / 2;
	const yOffsetDuetToScale = (height * (1 - scale)) / 2;

	const newX = xRelativeToWrapper - xOffsetDueToTranslation - xOffsetDuetToScale;
	const newY = yRelativeToWrapper - yOffsetDueToTranslation - yOffsetDuetToScale;

	// constantOffset makes it so the cursor is in a more user friendly place.
	const constantOffset = 20;
	const newCursorX = newX / scaleCapture - constantOffset * 2;
	const newCursorY = newY / scaleCapture - constantOffset;

	return { x: newCursorX, y: newCursorY };
};

export function calculateRelativePosition(
	dimensions: Graph['dimensions'],
	transforms: Graph['transforms'],
	position: { x: number; y: number }
) {
	const { top, left, width, height } = get(dimensions);
	const scale = get(transforms.scale);
	const translation = get(transforms.translation);
	const scaled = calculateRelativeCursor(
		{ clientX: position.x, clientY: position.y },
		top,
		left,
		width,
		height,
		scale,
		translation
	);
	return { scaled, scale };
}
