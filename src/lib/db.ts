import type { Generated } from 'kysely';

export interface DBCourse {
	id: Generated<string>;
	name: string;
	description: string | null;
	userId: string;
	createdAt: Generated<Date>;
	visibility: Generated<number>;
	labels: Generated<string[]>;
}

export interface DBResource {
	id: Generated<string>;
	courseId: string;
	userId: string;
	name: string;
	type: string;
	createdAt: Generated<Date>;
	modifiedAt: Generated<Date>;
	content: string;
	metadata: Generated<Record<string, unknown>>;
}

declare module '@axium/server/database.js' {
	export interface Schema {
		Course: DBCourse;
		Resource: DBResource;
	}
}
