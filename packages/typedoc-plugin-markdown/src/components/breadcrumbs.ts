import { BindOption, Reflection } from 'typedoc';
import {
  Component,
  ContextAwareRendererComponent,
} from 'typedoc/dist/lib/output/components';
import { PageEvent } from 'typedoc/dist/lib/output/events';

import MarkdownTheme from '../theme';

@Component({ name: 'breadcrumbs' })
export class Breadcrumbs extends ContextAwareRendererComponent {
  @BindOption('entryPoints')
  entryPoints!: string[];
  @BindOption('readme')
  readme!: string;

  initialize() {
    super.initialize();

    MarkdownTheme.HANDLEBARS.registerHelper(
      'breadcrumbs',
      (page: PageEvent) => {
        if (page.url === page.project.url) {
          // return null;
        }
        const breadcrumbs: string[] = [];

        breadcrumbs.push(
          page.url === page.project.url
            ? `**${page.project.name}**`
            : `[${
                page.project.name
              }](${MarkdownTheme.HANDLEBARS.helpers.relativeURL(
                page.project?.url,
              )})`,
        );
        const breadcrumbsOut = breadcrumb(page, page.model, breadcrumbs);
        const readme =
          this.readme !== 'none' && page.url === page.project.url
            ? `\n\n> [Readme](${MarkdownTheme.HANDLEBARS.helpers.relativeURL(
                'README.md',
              )})`
            : '';
        return breadcrumbsOut + readme;
      },
    );
  }
}

function breadcrumb(page: PageEvent, model: Reflection, md: string[]) {
  if (model && model.parent) {
    breadcrumb(page, model.parent, md);
    if (model.url) {
      md.push(
        page.url === model.url
          ? `${escape(model.name)}`
          : `[${escape(
              model.name,
            )}](${MarkdownTheme.HANDLEBARS.helpers.relativeURL(model.url)})`,
      );
    }
  }
  return md.join(' / ');
}
