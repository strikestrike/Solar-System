export { matchers } from './client-matchers.js';

export const nodes = [() => import('./nodes/0'),
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
	() => import('./nodes/15')];

export const server_loads = [0,2];

export const dictionary = {
	"/": [~3],
	"/article/[slug]": [~4],
	"/converter": [~5],
	"/editor": [~6],
	"/editor/[slug]": [~7],
	"/history/[id]": [~8],
	"/login": [~9],
	"/profile": [10],
	"/profile/@[user]": [~11,[2]],
	"/profile/@[user]/favorites": [~12,[2]],
	"/register": [~13],
	"/settings": [~14],
	"/tickets/[id]": [~15]
};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};