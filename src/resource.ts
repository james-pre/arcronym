import { css, html, LitElement, nothing, render } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Resource icons
export const icons = {
	video: html`<svg viewBox="0 0 24 24" width="24" height="24">
		<rect x="2" y="4" width="20" height="16" rx="2" ry="2" fill="var(--icon-bg)" />
		<polygon points="10,8 16,12 10,16" fill="var(--icon-fg)" />
	</svg>`,

	document: html`<svg viewBox="0 0 24 24" width="24" height="24">
		<path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z" fill="var(--icon-bg)" />
		<path d="M14,8V2.5L19.5,8H14z" fill="var(--icon-fg)" />
		<rect x="6" y="12" width="12" height="1" rx="0.5" fill="var(--icon-fg)" />
		<rect x="6" y="15" width="12" height="1" rx="0.5" fill="var(--icon-fg)" />
		<rect x="6" y="18" width="8" height="1" rx="0.5" fill="var(--icon-fg)" />
	</svg>`,
};

export type Icon = null | keyof typeof icons;

/**
 * A resource in the resource list
 */
@customElement('ile-resource')
export class Resource extends LitElement {
	static styles = css`
		:host {
			display: flex;
			align-items: center;
			gap: 0.5em;
			border-radius: 0.5em;
			cursor: pointer;
			border: 1px solid transparent;
		}

		:host(:hover) {
			background: #222;
		}

		:host(.selected) {
			border: 1px solid #555;
			background: #333;
			color: #fff;
		}

		div {
			padding: 0.25em;
		}
	`;

	@property() public accessor icon: Icon = null;

	@property() public accessor title: string = '';

	@property() public accessor contents: string = '';

	protected select = () => {
		document.querySelectorAll<Resource>('ile-resource.selected').forEach(resource => resource.classList.remove('selected'));
		this.classList.add('selected');
		render(this.renderContents(), document.querySelector<HTMLElement>('#content')!);
	};

	public constructor() {
		super();
		this.id = 'resource-' + Date.now();
		document.querySelector<HTMLElement>('#resources')!.appendChild(this);
	}

	public render() {
		return html`<div @click=${this.select}>${this.icon ? icons[this.icon] : nothing} ${this.title}</div> `;
	}

	public renderContents() {
		return html`
			<div class="header">
				<h1>${this.title}</h1>
			</div>
			<div class="body">${this.contents}</div>
		`;
	}
}

/**
 * Add a new document resource
 * @param title - The title of the resource
 * @param contents - The full contents of the resource
 * @returns The newly created resource
 */
export function addDocument(title: string, contents: string = ''): Resource {
	if (!title) throw new Error('Resource title is required');
	const resource = new Resource();
	resource.icon = 'document';
	resource.title = title;
	resource.contents = contents || '';

	return resource;
}
