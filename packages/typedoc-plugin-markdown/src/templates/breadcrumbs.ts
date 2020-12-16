import { Reflection } from 'typedoc';
import { PageEvent } from 'typedoc/dist/lib/output/events';

export const breadcrumbsTemplate = (page: PageEvent) => {
  const breadcrumbs: string[] = [];

  const globalsName = 'Modules';
  breadcrumbs.push(
    page.url === 'README.md'
      ? page.project.name
      : `[${page.project.name}]('README.md'))`,
  );
  // if (this.readme !== 'none') {
  breadcrumbs.push(
    page.url === page.project.url
      ? globalsName
      : `[${globalsName}](modules.md)})`,
  );
  // }
  const breadcrumbsOut = breadcrumb(page, page.model, breadcrumbs);
  return breadcrumbsOut;
};

function breadcrumb(page: PageEvent, model: Reflection, md: string[]) {
  if (model && model.parent) {
    breadcrumb(page, model.parent, md);
    if (model.url) {
      md.push(
        page.url === model.url
          ? `${escape(model.name)}`
          : `[${escape(model.name)}](${model.url})`,
      );
    }
  }
  return md.join(' / ');
}
