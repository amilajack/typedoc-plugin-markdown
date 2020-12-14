import * as path from 'path';

import * as fs from 'fs-extra';
import { BindOption } from 'typedoc';
import { Component } from 'typedoc/dist/lib/converter/components';
import { RendererComponent } from 'typedoc/dist/lib/output/components';
import { PageEvent, RendererEvent } from 'typedoc/dist/lib/output/events';

import { SidebarItem } from '../../types';

@Component({ name: 'sidebar' })
export class SidebarComponent extends RendererComponent {
  @BindOption('sidebarFile')
  sidebarFile!: string;
  @BindOption('siteDir')
  siteDir!: string;
  @BindOption('outFolder')
  outFolder!: string;

  initialize() {
    this.listenTo(this.owner, {
      [RendererEvent.END]: this.onRendererEnd,
    });
  }
  onRendererEnd(page: PageEvent) {
    const sidebarPath = path.resolve(this.siteDir, this.sidebarFile);
    const navigation = this.application.renderer.theme?.getNavigation(
      page.project,
    );
    // map the navigation object to a Docuaurus sidebar format
    const sidebarItems = navigation?.children
      ? navigation.children.map((navigationItem) => {
          if (navigationItem.isLabel) {
            const sidebarCategoryItems = navigationItem.children
              ? navigationItem.children.map((navItem) => {
                  const url = this.getUrlKey(this.outFolder, navItem.url);
                  if (navItem.children && navItem.children.length > 0) {
                    const sidebarCategoryChildren = navItem.children.map(
                      (childGroup) =>
                        this.sidebarCategory(
                          childGroup.title,
                          childGroup.children
                            ? childGroup.children.map((childItem) =>
                                this.getUrlKey(this.outFolder, childItem.url),
                              )
                            : [],
                        ),
                    );
                    return this.sidebarCategory(navItem.title, [
                      url,
                      ...sidebarCategoryChildren,
                    ]);
                  }
                  return url;
                })
              : [];
            return this.sidebarCategory(
              navigationItem.title,
              sidebarCategoryItems,
            );
          }
          return this.getUrlKey(this.outFolder, navigationItem.url);
        })
      : [];

    // write result to disk
    fs.outputFileSync(
      sidebarPath,
      `module.exports = ${JSON.stringify(sidebarItems, null, 2)};`,
    );

    this.application.logger.success(
      `[docusaurus-plugin-typedoc] TypeDoc sidebar written to ${sidebarPath}`,
    );
  }

  /**
   * returns a sidebar category node
   */
  sidebarCategory(title: string, items: SidebarItem[]) {
    return {
      type: 'category',
      label: title,
      items,
    };
  }

  /**
   * returns the url key for relevant doc
   */
  getUrlKey(outFolder: string, url: string) {
    const urlKey = url.replace('.md', '');
    return outFolder ? outFolder + '/' + urlKey : urlKey;
  }
}
