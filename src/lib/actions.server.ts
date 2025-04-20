import { adapter } from '@axium/server/auth.js';
import { logger } from '@axium/server/io.js';
import { parseForm } from '@axium/server/web/utils.js';
import { fail, type RequestEvent } from '@sveltejs/kit';
import { EditCourse } from './data.js';
import { getCourse, updateCourse } from './data.server.js';

export async function course_edit(event: RequestEvent) {
	const session = await event.locals.auth();
	if (!session?.user?.email) return fail(401, { error: 'You are not signed in' });

	const user = await adapter.getUserByEmail!(session.user.email);
	if (!user) return fail(500, { error: 'User does not exist' });

	const [data, error] = await parseForm(event, EditCourse);
	if (error) return error;
	if (!data.id) return fail(400, { error: 'Course ID is required' });

	const course = await getCourse(data.id);
	if (!course) return fail(404, { error: 'Course not found' });

	if (course.userId !== user.id) return fail(403, { error: 'Only the course owner can edit the course for now' });

	try {
		await updateCourse(data);
		logger.debug(`Updated course ${course.id}`);
	} catch (e: any) {
		logger.warn(`Failed to update course ${course.id}: ${e}`);
		return fail(500, { error: 'Failed to update course' });
	}
	return { success: true };
}
