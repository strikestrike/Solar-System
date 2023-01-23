// @ts-nocheck
/** @param {Parameters<import('./$types').LayoutServerLoad>[0]} event */
export function load({ locals }) {
	return {
		user: locals.user && {
			username: locals.user.username,
			email: locals.user.email,
			image: locals.user.image,
			bio: locals.user.bio
		}
	};
}
