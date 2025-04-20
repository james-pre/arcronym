import { AddResource, hasPermission, Permission, RemoveResource, UpdatePlainText, UploadResource } from '$lib/data.js';
import { createResource, deleteResource, getCourse, updateResource } from '$lib/data.server.js';
import { adapter } from '@axium/server/auth.js';
import { parseForm } from '@axium/server/web/utils.js';
import { error, fail, type Actions } from '@sveltejs/kit';
import { createHash } from 'node:crypto';
import type { PageServerLoadEvent } from './$types';
import { logger } from '@axium/server/io.js';
import { course_edit } from '../../../lib/actions.server';

const hash = createHash('BLAKE2s256');

export async function load(event: PageServerLoadEvent) {
	const data = await event.parent();
	const { session, user } = data;

	const id = event.params.course;

	const course = await getCourse(id);
	if (!course) return error(404, 'Course does not exist');
	if (!hasPermission(course, user?.id, 1)) return error(403, 'You do not have permission to view this course');

	return { session, user, course };
}

export const actions = {
	course_edit,
	async upload_resource(event) {
		const session = await event.locals.auth();
		if (!session?.user?.email) return fail(401, { error: 'You are not signed in' });

		const user = await adapter.getUserByEmail!(session.user.email);
		if (!user) return fail(500, { error: 'User does not exist' });

		const courseId = event.params.course;
		if (!courseId) return fail(500, { error: 'Missing course ID' });

		const [{ file } = {}, error] = await parseForm(event, UploadResource);
		if (error) return error;
		if (!file) return fail(400, { error: 'File is required' });

		const u8 = new Uint8Array(await file.arrayBuffer());
		const hashed = hash.update(u8).digest('hex');

		try {
			await createResource({ userId: user.id, courseId, name: file.name, type: file.type, content: hashed });
		} catch (error: any) {
			logger.error(`Failed to upload resource to course ${courseId} for user ${user.id}: ${error.message}`);
			return fail(500, { error: 'Failed to upload resource' });
		}
		return { success: true };
	},
	async add_resource(event) {
		const session = await event.locals.auth();
		if (!session?.user?.email) return fail(401, { error: 'You are not signed in' });

		const user = await adapter.getUserByEmail!(session.user.email);
		if (!user) return fail(500, { error: 'User does not exist' });

		const courseId = event.params.course;
		if (!courseId) return fail(500, { error: 'Missing course ID' });

		const [resource, error] = await parseForm(event, AddResource);
		if (error) return error;
		if (!resource) return fail(500, { error: 'Resource missing but no error was triggered' });

		try {
			await createResource({ userId: user.id, courseId, ...resource });
		} catch (error: any) {
			logger.error(`Failed to add resource to course ${courseId} for user ${user.id}: ${error.message}`);
			return fail(500, { error: 'Failed to add resource' });
		}
		return { success: true };
	},
	async remove_resource(event) {
		const session = await event.locals.auth();
		if (!session?.user?.email) return fail(401, { error: 'You are not signed in' });

		const user = await adapter.getUserByEmail!(session.user.email);
		if (!user) return fail(500, { error: 'User does not exist' });

		const courseId = event.params.course;
		if (!courseId) return fail(500, { error: 'Missing course ID' });

		const [{ id } = {}, error] = await parseForm(event, RemoveResource);
		if (error) return error;
		if (!id) return fail(500, { error: 'Resource ID missing but no error was triggered' });

		const course = await getCourse(courseId);
		if (!course) return fail(500, { error: 'Course not found' });

		if (!hasPermission(course, user.id, Permission.Edit)) return fail(403, { error: 'You do not have permission to remove this resource' });

		try {
			await deleteResource(id);
		} catch (error: any) {
			logger.error(`Failed to delete resource ${id} from course ${courseId} for user ${user.id}: ${error.message}`);
			return fail(500, { error: 'Failed to delete resource' });
		}
		return { success: true };
	},
	async update_plain_text(event) {
		const session = await event.locals.auth();
		if (!session?.user?.email) return fail(401, { error: 'You are not signed in', toast: true });

		const user = await adapter.getUserByEmail!(session.user.email);
		if (!user) return fail(500, { error: 'User does not exist', toast: true });

		const courseId = event.params.course;
		if (!courseId) return fail(500, { error: 'Missing course ID', toast: true });

		const [resource, error] = await parseForm(event, UpdatePlainText, { toast: true });
		if (error) return error;

		if (!resource) return fail(500, { error: 'Resource missing but no error was triggered', toast: true });

		try {
			await updateResource(resource);
		} catch (error: any) {
			logger.error(`Failed to update resource in course ${courseId} for user ${user.id}: ${error.message}`);
			return fail(500, { error: 'Failed to update resource', toast: true });
		}
		return { success: true, toast: true };
	},
} satisfies Actions;
