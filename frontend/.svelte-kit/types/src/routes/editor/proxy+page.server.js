// @ts-nocheck
import { redirect, fail } from '@sveltejs/kit';
import * as api from '$lib/api.js';

/** @param {Parameters<import('./$types').PageServerLoad>[0]} event */
export async function load({ locals }) {
	if (!locals.user) throw redirect(302, `/login`);
}

/** */
export const actions = {
	default:/** @param {import('./$types').RequestEvent} event */  async ({ locals, request }) => {
		if (!locals.user) throw error(401);

		const data = await request.formData();

		const result = await api.post(
			'articles',
			{
				article: {
					title: data.get('title'),
					description: data.get('description'),
					body: data.get('body'),
					tagList: data.getAll('tag')
				}
			},
			locals.user.token
		);

		if (result.errors) return fail(400, result);

		throw redirect(303, `/article/${result.article.slug}`);
	}
};
