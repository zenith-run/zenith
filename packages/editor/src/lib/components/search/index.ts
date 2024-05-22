import { Spec as EnumerateSpec } from '@zenith-run/std/components/flow/specs/enumerate';
import { Spec as BranchSpec } from '@zenith-run/std/components/flow/specs/branch';
import { Spec as SumSpec } from '@zenith-run/std/components/math/specs/sum';
import type { ComponentSpec } from '@zenith-run/core/component';

export type SearchComponentsOptions = {
	query: string;
};

export type ComponentSearchResponse = {
	results: ComponentSpec[];
};

export async function searchComponents({
	query
}: SearchComponentsOptions): Promise<ComponentSearchResponse> {
	const response = { results: [EnumerateSpec, BranchSpec, SumSpec] };
	const promise = new Promise<ComponentSearchResponse>((resolve) => {
		setTimeout(() => {
			resolve(response);
		}, 100);
	});
	return promise;
}
