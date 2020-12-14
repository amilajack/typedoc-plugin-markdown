import * as path from 'path';

import { Application, ProjectReflection, UrlMapping } from 'typedoc';
import { RendererComponent } from 'typedoc/dist/lib/output/components';
import { PageEvent, RendererEvent } from 'typedoc/dist/lib/output/events';
import { writeFile } from 'typedoc/dist/lib/utils';
import {
  ChildableComponent,
  Component,
} from 'typedoc/dist/lib/utils/component';

import MarkdownTheme from './theme';

@Component({
  name: 'markdown-renderer',
  internal: true,
  childClass: RendererComponent,
})
export class MarkdownRenderer extends ChildableComponent<
  Application,
  RendererComponent
> {
  /**
   * Create a new Renderer instance.
   *
   * @param application  The application this dispatcher is attached to.
   */
  initialize() {}

  theme;

  /**
   * Render the given project reflection to the specified output directory.
   *
   * @param project  The project that should be rendered.
   * @param outputDirectory  The path of the directory the documentation should be rendered to.
   */
  async render(project: ProjectReflection, outputDirectory: string) {
    this.theme = this.addComponent(
      'theme',
      new MarkdownTheme(
        this.application.renderer,
        path.resolve(__dirname, '..', 'dist'),
      ),
    );
    this.theme!.resources.activate();

    const output = new RendererEvent(
      RendererEvent.BEGIN,
      outputDirectory,
      project,
    );
    output.settings = this.application.options.getRawValues();
    output.urls = this.theme!.getUrls(project);
    const urls = this.theme!.getUrls(project);
    urls.forEach((mapping: UrlMapping) => {
      this.renderMarkdownDocument(output.createPageEvent(mapping));
    });
  }

  private renderMarkdownDocument(page: PageEvent): boolean {
    this.trigger(PageEvent.BEGIN, page);
    if (page.isDefaultPrevented) {
      return false;
    }

    // Theme must be set as this is only called in render, and render ensures theme is set.
    page.template =
      page.template ||
      this.theme!.resources.templates.getResource(
        page.templateName,
      )!.getTemplate();

    if (page.template) {
      page.contents = page.template(page, {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true,
      });
    }

    this.trigger(PageEvent.END, page);
    if (page.isDefaultPrevented) {
      return false;
    }

    try {
      if (page.contents) {
        writeFile(page.filename, page.contents, false);
      }
    } catch (error) {
      this.application.logger.error('Could not write %s', page.filename);
      return false;
    }

    return true;
  }
}
