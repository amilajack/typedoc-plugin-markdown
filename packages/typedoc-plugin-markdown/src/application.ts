import * as path from 'path';

import * as fs from 'fs-extra';
import { Application, ProjectReflection, UrlMapping } from 'typedoc';
import { RendererEvent } from 'typedoc/dist/lib/output/events';
import { Component, ParameterType } from 'typedoc/dist/lib/utils';

import { MarkdownRenderer } from './renderer';
import { reflectionTemplate } from './templates/reflection';
import MarkdownTheme from './theme';

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

  async generateDocs(
    project: ProjectReflection,
    outputDirectory: string,
  ): Promise<void> {
    outputDirectory = path.resolve(outputDirectory);

    const theme = new MarkdownTheme(
      this.application.renderer,
      path.resolve(__dirname, '..', 'dist'),
    );

    const output = new RendererEvent(
      RendererEvent.BEGIN,
      outputDirectory,
      project,
    );
    const urls = theme.getUrls(project);

    urls.forEach((mapping: UrlMapping) => {
      fs.outputFileSync(
        outputDirectory + '/' + mapping.url,
        reflectionTemplate(output.createPageEvent(mapping)),
      );
    });
    console.log('urls written');
  }
}
