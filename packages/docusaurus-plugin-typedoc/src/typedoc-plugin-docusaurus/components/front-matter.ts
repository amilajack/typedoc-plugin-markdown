import * as path from 'path';

import { BindOption } from 'typedoc';
import { reflectionTitle } from 'typedoc-plugin-markdown/dist/resources/helpers/reflection-title';
import { Component } from 'typedoc/dist/lib/converter/components';
import { RendererComponent } from 'typedoc/dist/lib/output/components';
import { PageEvent } from 'typedoc/dist/lib/output/events';

@Component({ name: 'front-matter' })
export class FrontMatterComponent extends RendererComponent {
  @BindOption('outFolder')
  outFolder!: string;
  @BindOption('globalsTitle')
  globalsTitle!: string;
  @BindOption('readmeTitle')
  readmeTitle!: string;
  entryFile = 'README.md';
  globalsFile = 'modules.md';

  initialize() {
    this.listenTo(this.owner, {
      [PageEvent.END]: this.onPageEnd,
    });
  }
  onPageEnd(page: PageEvent) {
    if (page.contents) {
      page.contents = page.contents
        .replace(/^/, this.getYamlString(this.getYamlItems(page)) + '\n\n')
        .replace(/[\r\n]{3,}/g, '\n\n');
    }
  }

  getYamlString(yamlItems: { [key: string]: string | number | boolean }) {
    const yaml = `---
${Object.entries(yamlItems)
  .map(
    ([key, value]) =>
      `${key}: ${
        typeof value === 'string' ? `"${this.escapeYAMLString(value)}"` : value
      }`,
  )
  .join('\n')}
---`;
    return yaml;
  }

  getYamlItems(page: PageEvent): any {
    const pageId = this.getId(page);
    const pageTitle = this.getTitle(page);
    const sidebarLabel = this.getSidebarLabel(page);
    let items: any = {
      id: pageId,
      title: pageTitle,
    };

    if (page.url === this.entryFile) {
      items = { ...items, slug: '/' + this.outFolder };
    }
    if (sidebarLabel !== pageTitle) {
      items = { ...items, sidebar_label: sidebarLabel };
    }
    if (page.url === this.entryFile && page.url !== page.project.url) {
      items = { ...items, hide_title: true };
    }
    return {
      ...items,
    };
  }

  getSidebarLabel(page: PageEvent) {
    return page.model.name;
  }

  getDefaultValues(page: PageEvent) {
    return {
      id: this.getId(page),
      title: this.getTitle(page),
    };
  }

  getId(page: PageEvent) {
    return path.basename(page.url, path.extname(page.url));
  }

  getTitle(page: PageEvent) {
    const globalsTitle = this.globalsTitle || page.project.name;
    const readmeTitle = this.readmeTitle || page.project.name;
    if (page.url === this.entryFile) {
      return page.url === page.project.url ? globalsTitle : readmeTitle;
    }
    if (page.url === this.globalsFile) {
      return globalsTitle;
    }
    return reflectionTitle.call(page, false);
  }

  // prettier-ignore
  escapeYAMLString(str: string) {
    return str.replace(/([^\\])'/g, '$1\\\'').replace(/\"/g, '');
  }
}
