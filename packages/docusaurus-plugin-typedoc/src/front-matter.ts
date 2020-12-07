import { Renderer } from 'typedoc';
import { FrontMatterComponent } from 'typedoc-plugin-markdown/dist/components/front-matter';
import { Component } from 'typedoc/dist/lib/output/components';
import { PageEvent } from 'typedoc/dist/lib/output/events';

import { FrontMatter, PluginOptions, SidebarOptions } from './types';

@Component({ name: 'docusaurus-frontmatter' })
export class DocusaurusFrontMatterComponent extends FrontMatterComponent {
  outFolder: string;
  sidebar: SidebarOptions | null;
  readmeTitle?: string;
  indexTitle?: string;
  entryFile = 'index.md';
  globalsFile = 'modules.md';

  constructor(renderer: Renderer, options: PluginOptions) {
    super(renderer);
    this.outFolder = options?.out;
    this.sidebar = options?.sidebar;
    this.readmeTitle = options?.readmeTitle;
    this.indexTitle = options?.indexTitle || options?.globalsTitle;
  }
  getYamlItems(page: PageEvent): FrontMatter {
    const pageId = this.getId(page);
    const pageTitle = this.getTitle(page);
    const sidebarLabel = this.getSidebarLabel(page);
    let items: FrontMatter = {
      id: pageId,
      title: pageTitle,
    };
    if (page.url === this.entryFile) {
      items = { ...items, slug: '/' + this.outFolder };
    }
    if (this.sidebar && sidebarLabel !== pageTitle) {
      items = { ...items, sidebar_label: sidebarLabel };
    }
    if (page.url === this.entryFile && page.url !== page.project.url) {
      items = { ...items, hide_title: true };
    }
    return {
      ...items,
    };
  }

  getTitle(page: PageEvent) {
    const globalsTitle = this.indexTitle || 'Index';
    const readmeTitle = this.readmeTitle || page.project.name;
    if (page.url === this.entryFile) {
      return page.url === page.project.url ? globalsTitle : readmeTitle;
    }
    if (this.indexTitle && page.url === this.globalsFile) {
      return globalsTitle;
    }
    return super.getTitle(page);
  }

  getSidebarLabel(page: PageEvent) {
    if (page.url === this.entryFile) {
      return page.url === page.project.url
        ? this.sidebar?.globalsLabel || this.sidebar?.indexLabel
        : this.sidebar?.readmeLabel;
    }

    if (page.url === this.globalsFile) {
      return this.sidebar?.globalsLabel;
    }

    return this.sidebar?.fullNames ? page.model.getFullName() : page.model.name;
  }
}
