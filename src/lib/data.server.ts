import { adapter } from '@axium/server/auth.js';
import { database } from '@axium/server/database.js';
import { getShares } from '@axium/shares/server.js';
import type { Course, Resource } from './data.js';

export async function getCourses(userId: string): Promise<Course[]> {
	const result: Course[] = [];

	for (const course of await database.withSchema('arc').selectFrom('Course').selectAll().where('userId', '=', userId).execute()) {
		result.push({ ...course, isShared: false });
	}

	for (const course of await database
		.withSchema('arc')
		.selectFrom('Course as course')
		.innerJoin('shares.Course as share', 'share.itemId', 'course.id')
		.where('share.userId', '=', userId)
		.selectAll()
		.execute()) {
		result.push({ ...course, isShared: true });
	}

	return result;
}

export async function getCourse(id: string, userId?: string): Promise<(Required<Course> & { _: Course }) | undefined> {
	const course: Course | undefined = await database.withSchema('arc').selectFrom('Course').selectAll().where('id', '=', id).executeTakeFirst();
	if (!course) return undefined;

	const shares = await getShares('Course', id);

	return Object.assign(course, {
		_: { ...course },
		user: await adapter.getUser!(course.userId),
		shares,
		isShared: shares.some(share => share.userId == userId),
		resources: await database.withSchema('arc').selectFrom('Resource').where('courseId', '=', id).selectAll().execute(),
		projects: [],
	});
}

export async function createCourse(userId: string, data: Partial<Course> & Pick<Course, 'name'>): Promise<void> {
	await database
		.withSchema('arc')
		.insertInto('Course')
		.values({ ...data, userId })
		.execute();
}

export async function deleteCourse(id: string): Promise<void> {
	await database.withSchema('arc').deleteFrom('Course').where('id', '=', id).execute();
}

export async function updateCourse(course: Partial<Course> & Pick<Course, 'id'>): Promise<void> {
	await database.withSchema('arc').updateTable('Course').set(course).where('id', '=', course.id).execute();
}

export async function createResource(data: Partial<Resource> & Pick<Resource, 'userId' | 'courseId' | 'name' | 'type' | 'content'>): Promise<void> {
	await database.withSchema('arc').insertInto('Resource').values(data).execute();
}

export async function deleteResource(id: string): Promise<void> {
	await database.withSchema('arc').deleteFrom('Resource').where('id', '=', id).execute();
}

export async function updateResource(data: Partial<Resource> & Pick<Resource, 'id'>): Promise<void> {
	await database.withSchema('arc').updateTable('Resource').set(data).where('id', '=', data.id).execute();
}

export async function getResource(id: string): Promise<Resource | undefined> {
	const resource = await database.withSchema('arc').selectFrom('Resource').where('id', '=', id).selectAll().executeTakeFirst();
	if (!resource) return undefined;

	return resource;
}
