export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20')
];

export const server_loads = [];

export const dictionary = {
		"/": [5],
		"/admin": [6,[2]],
		"/admin/actions": [7,[2]],
		"/admin/activity": [8,[2]],
		"/admin/burn": [9,[2]],
		"/admin/info": [~10,[2]],
		"/admin/mint": [11,[2]],
		"/admin/multisig": [12,[2]],
		"/admin/overflow": [13,[2]],
		"/admin/rounds": [14,[2]],
		"/admin/withdraw": [15,[2]],
		"/dao-generator": [16,[3]],
		"/dao-generator/generate": [17,[3,4]],
		"/discover": [18],
		"/p/[contractName]": [19],
		"/signatures-queue": [20]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';