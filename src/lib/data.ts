import type { User } from '@auth/sveltekit';
import * as z from 'zod';

export function randomID() {
	return Math.random().toString(36).substring(2);
}

export interface ResourceInfo {
	id: string;
	type: string | RegExp;
	text: string;
	icon: string;
}

export const resourceMetadata = [
	{ id: 'audio', type: /audio\/.*/, text: 'Audio', icon: 'waveform-lines' },
	{ id: 'markdown', type: 'text/markdown', text: 'Document', icon: 'memo-pad' },
	{ id: 'file', type: 'application/octet-stream', text: 'File', icon: 'file' },
	{ id: 'plain', type: 'text/plain', text: 'Plain Text', icon: 'memo' },
	{ id: 'image', type: /image\/.*/, text: 'Image', icon: 'image' },
	{ id: 'video', type: /video\/.*/, text: 'Video', icon: 'clapperboard-play' },
	{ id: 'link', type: 'text/x-uri', text: 'Link', icon: 'link-simple' },
	{ id: 'unknown', type: /.*/, text: 'Unknown', icon: 'file-circle-question' },
] as const satisfies ResourceInfo[];

export function resourceInfo(type: string): ResourceInfo {
	for (const info of resourceMetadata) {
		if (typeof info.type === 'string' ? info.type == type : info.type.test(type)) return info;
	}
	throw new Error('Unreachable code! (while resolving resource type)');
}

export interface Resource {
	id: string;
	courseId: string;
	userId: string;
	name: string;
	type: string;
	createdAt: Date;
	modifiedAt: Date;
	content: string;
}

export interface Resource_S extends Resource {
	selected?: boolean;
}

export const UploadResource = z.object({
	file: z.instanceof(File),
});

export const AddResource = z.object({
	name: z.string().min(1, 'Resource name is required').max(100),
	type: z.enum(['text/plain', 'text/markdown', 'text/x-uri']),
	content: z.string().max(10_000, 'Please add your remaining content after creating the resource.'),
});

export const RemoveResource = z.object({
	id: z.string().uuid(),
});

export const UpdatePlainText = z.object({
	id: z.string().uuid(),
	content: z.string().max(10_000, 'Content must be less than 100k characters (why are you trying to write so much?!)'),
});

/**
 * Resources uploaded from files are stored as BLAKE3 hashes to reduce DB size and to de-duplicate files.
 * This hash is what is actually stored in these resources' `content` field.
 * This function gets the URL to the file.
 */
export function resourceURL(content: string): string {
	/** @todo Replace with the actual domain and such once implemented! */
	return 'https://resources.example.com/' + content;
}

export interface Project {
	id: string;
	title: string;
}

export interface Course {
	id: string;
	name: string;
	userId: string;
	createdAt: Date;
	description: string | null;
	labels: string[];
	visibility: number;
	isShared?: boolean;
	user?: User;
	shares?: CourseShare[];
	resources?: Resource[];
	projects?: Project[];
}

export const EditCourse = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, 'Course name is required').max(100),
	description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

export const CreateCourse = z.object({
	name: z.string().min(1, 'Course name is required').max(100),
	description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

/** @todo Consider moving shares into a reusable package (e.g. @axium/acl) */

export interface CourseShare {
	courseId: string;
	userId: string;
	user?: User;
	sharedAt: Date;
	permission: number;
}

export enum Visibility {
	Private = 0,
	Friends = 10,
	Public = 20,
}

export function visibilityText(vis: Visibility): string {
	if (vis >= Visibility.Public) return 'Public';
	if (vis >= Visibility.Friends) return 'Friends';
	return 'Private';
}

export enum Permission {
	None = 0,
	Read = 1,
	Comment = 2,
	Edit = 3,
	Manage = 5,
}

export const permissionNames = {
	[Permission.None]: 'No Permissions',
	[Permission.Read]: 'Reader',
	[Permission.Comment]: 'Commenter',
	[Permission.Edit]: 'Editor',
	[Permission.Manage]: 'Manager',
} satisfies Record<Permission, string>;

export function hasPermission(course: Course, userId: string | undefined, permission: number): boolean {
	if (course.visibility >= Visibility.Public) return true;
	if (!userId) return false;
	if (course.userId == userId) return true;

	/** @todo Once friends are implemented, add logic here */

	const share = course.shares?.find(share => share.userId == userId);
	if (!share) return false;

	return share.permission >= permission;
}
