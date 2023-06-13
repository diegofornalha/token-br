import type { ProgressStates } from '@emerald-dao/component-library/components/ProgressStep/progress-states.type';
import type { SvelteComponent } from 'svelte';

export interface Step {
	name: string;
	description?: string;
	slug?: string;
	component: typeof SvelteComponent;
	action: null | (() => Promise<ActionExecutionResult>);
	form: boolean;
	isValid?: boolean;
	state: ProgressStates;
	button?: {
		text: string;
		icon?: string;
	};
}

export interface ActionExecutionResult {
	state: 'success' | 'error';
	errorMessage: string;
}
