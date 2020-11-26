import { ProjectReflection, ReflectionGroup } from 'typedoc/dist/lib/models';

import MarkdownTheme from '../../theme';

export function pageIndex(this: ProjectReflection) {
  const md: string[] = [``];
  const isVisible = this.groups?.some((group) =>
    group.allChildrenHaveOwnDocument(),
  );
  if (isVisible && this.groups) {
    this.groups?.forEach((group) => {
      const groupTitle = group.title;
      if (group.categories) {
        group.categories.forEach((category) => {
          md.push(`## ${category.title} ${groupTitle}\n\n`);
          pushGroup(category as any, md);
          md.push('\n');
        });
      } else {
        if (group.allChildrenHaveOwnDocument()) {
          md.push(`## ${groupTitle}\n\n`);
          pushGroup(group, md);
          md.push('\n');
        }
      }
    });
  }
  return md.join('\n');
}

const pushGroup = (group: ReflectionGroup, md: string[]) => {
  const children = group.children.map(
    (child) =>
      `- [${child.name}](${MarkdownTheme.HANDLEBARS.helpers.relativeURL(
        child.url,
      )})`,
  );
  md.push(children.join('\n'));
};
