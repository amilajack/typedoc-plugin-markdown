import * as path from 'path';

import { Application, ProjectReflection } from 'typedoc';
import { Component, ParameterType } from 'typedoc/dist/lib/utils';

import { MarkdownRenderer } from './renderer';

@Component({ name: 'markdown-application', internal: true })
export class MarkdownApplication extends Application {
  markdownRenderer: MarkdownRenderer;
  constructor() {
    super();
    this.markdownRenderer = this.addComponent<MarkdownRenderer>(
      'markdown-renderer',
      MarkdownRenderer,
    );
  }

  bootstrap() {
    super.bootstrap();

    this.options.addDeclaration({
      help: '[Markdown Plugin] Do not render project name in template header.',
      name: 'hideProjectName',
      type: ParameterType.Boolean,
      defaultValue: false,
    });

    this.options.addDeclaration({
      help: '[Markdown Plugin] Do not render breadcrumbs in template.',
      name: 'hideBreadcrumbs',
      type: ParameterType.Boolean,
      defaultValue: false,
    });

    this.options.addDeclaration({
      help:
        '[Markdown Plugin] Specifies the base path that all links to be served from. If omitted all urls will be relative.',
      name: 'publicPath',
      type: ParameterType.String,
    });

    this.options.addDeclaration({
      help:
        '[Markdown Plugin] Use HTML named anchors as fragment identifiers for engines that do not automatically assign header ids. Should be set for Bitbucket Server docs.',
      name: 'namedAnchors',
      type: ParameterType.Boolean,
      defaultValue: false,
    });

    this.options.addDeclaration({
      help:
        '[Markdown Plugin] Output all reflections into seperate output files.',
      name: 'allReflectionsHaveOwnDocument',
      type: ParameterType.Boolean,
      defaultValue: false,
    });

    // this.converter.addComponent('markdown', new MarkdownPlugin(this.converter));
  }

  async generateDocs(project: ProjectReflection, out: string): Promise<void> {
    out = path.resolve(out);
    console.log('GENERATE');
    await this.markdownRenderer.render(project, out);
    if (this.logger.hasErrors()) {
      this.logger.error(
        '[typedoc-plugin-markdown] Documentation could not be generated due to the errors above.',
      );
    } else {
      this.logger.success(
        '[typedoc-plugin-markdown] Documentation generated at %s',
        out,
      );
    }
  }
}
