import { UserSettings } from '$lib/settings.js';
import { adapter } from '@axium/server/auth.js';
import config from '@axium/server/config.js';
import { editEmail, editName, parseForm } from '@axium/server/web/server';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export async function load(event) {
	const data = await event.parent();
	if (!data.user) throw redirect(307, '/auth/signin');
	return { session: data.session, user: data.user, prefix: config.web.prefix };
}

export const actions = {
	async settings(event) {
		const session = await event.locals.auth();
		if (!session?.user?.email) return fail(401, { error: 'You are not signed in' });

		const [settings, error] = await parseForm(event, UserSettings);
		if (error) return error;

		const user = await adapter.getUserByEmail!(session.user.email);
		if (!user) return fail(500, { settings, error: 'User does not exist' });

		await adapter.updateUser!({ id: user.id, preferences: { ...settings, _roles: user.preferences._roles } });

		return { success: true, settings };
	},
	name: editName,
	email: editEmail,
} satisfies Actions;
