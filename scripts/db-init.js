#!/usr/bin/env node
import { loadDefaults } from '@axium/server/config.js';
import { connect, database as db } from '@axium/server/database.js';
import { exit, defaultOutput as out, someWarnings } from '@axium/server/io.js';
import { sql } from 'kysely';

loadDefaults();
connect();

const done = () => out('done');
const alreadyExists = someWarnings(out, [/(relation|schema) "\w+" already exists/, 'already exists.']);

try {
	out('start', 'Creating schema arc');
	await db.schema.createSchema('arc').execute().then(done).catch(alreadyExists);

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
		.catch(alreadyExists);

	out('start', 'Creating index for Course.userId');
	await db.schema.withSchema('arc').createIndex('Course_userId_index').on('Course').column('userId').execute().then(done).catch(alreadyExists);

	out('start', 'Creating table CourseShare');
	await db.schema
		.withSchema('arc')
		.createTable('CourseShare')
		.addColumn('courseId', 'uuid', col => col.notNull().references('Course.id').onDelete('cascade').onUpdate('cascade'))
		.addColumn('userId', 'uuid', col => col.notNull().references('public.User.id').onDelete('cascade').onUpdate('cascade'))
		.addColumn('sharedAt', 'timestamptz', col => col.notNull().defaultTo(sql`now()`))
		.addColumn('permission', 'smallint', col => col.notNull())
		.execute()
		.then(done)
		.catch(alreadyExists);

	out('start', 'Creating index for CourseShare.userId');
	await db.schema.withSchema('arc').createIndex('CourseShare_userId_index').on('CourseShare').column('userId').execute().then(done).catch(alreadyExists);

	out('start', 'Creating index for CourseShare.courseId');
	await db.schema.withSchema('arc').createIndex('CourseShare_courseId_index').on('CourseShare').column('courseId').execute().then(done).catch(alreadyExists);

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
		.addColumn('kind', 'text', col => col.notNull())
		.addColumn('content', 'text', col => col.notNull())
		.execute()
		.then(done)
		.catch(alreadyExists);

	out('start', 'Creating index for Resource.userId');
	await db.schema.withSchema('arc').createIndex('Resource_userId_index').on('Resource').column('userId').execute().then(done).catch(alreadyExists);
} catch (e) {
	exit(e);
} finally {
	await db.destroy();
}
