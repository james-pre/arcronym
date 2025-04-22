import { sql } from 'kysely';
import { count } from '@axium/server/database.js';

export const id = 'arcronym';

export const version = 'prototype';

export const name = 'Arcronym';

export async function statusText() {
	return `${await count('arc.Course')} courses, ${await count('arc.Resource')} resources`;
}

export async function db_init(opt, db, { done, warnExists }) {
	const out = opt.output;

	out('start', 'Creating schema arc');
	await db.schema.createSchema('arc').execute().then(done).catch(warnExists);

	out('start', 'Creating table Course');
	await db.schema
		.withSchema('arc')
		.createTable('Course')
		.addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('userId', 'uuid', col => col.notNull().references('public.User.id').onDelete('cascade').onUpdate('cascade'))
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
		.addColumn('description', 'text')
		.addColumn('visibility', 'smallint', col => col.notNull().defaultTo(0))
		.addColumn('labels', sql`text[]`, col => col.notNull().defaultTo(sql`'{}'::text[]`))
		.addColumn('options', sql`jsonb`, col => col.notNull().defaultTo(sql`'{}'::jsonb`))
		.execute()
		.then(done)
		.catch(warnExists);

	out('start', 'Creating index for Course.userId');
	await db.schema.withSchema('arc').createIndex('Course_userId_index').on('Course').column('userId').execute().then(done).catch(warnExists);

	out('start', 'Creating table Resource');
	await db.schema
		.withSchema('arc')
		.createTable('Resource')
		.addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
		.addColumn('courseId', 'uuid', col => col.notNull().references('Course.id').onDelete('cascade').onUpdate('cascade'))
		.addColumn('userId', 'uuid', col => col.notNull().references('public.User.id').onDelete('cascade').onUpdate('cascade'))
		.addColumn('createdAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
		.addColumn('modifiedAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('type', 'text', col => col.notNull())
		.addColumn('content', 'text', col => col.notNull())
		.execute()
		.then(done)
		.catch(warnExists);

	out('start', 'Creating index for Resource.userId');
	await db.schema.withSchema('arc').createIndex('Resource_userId_index').on('Resource').column('userId').execute().then(done).catch(warnExists);
}
