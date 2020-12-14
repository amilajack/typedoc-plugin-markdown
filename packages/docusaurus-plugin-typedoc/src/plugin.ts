import * as path from 'path';

import { LoadContext } from '@docusaurus/types';
import * as fs from 'fs-extra';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';

import { PluginOptions } from './types';

const DEFAULT_PLUGIN_OPTIONS: PluginOptions = {
  id: 'default',
  docsRoot: 'docs',
  out: 'api',
  sidebar: {
    fullNames: false,
    sidebarFile: 'typedoc-sidebar.js',
    globalsLabel: 'Index',
    readmeLabel: 'Readme',
  },
  globalsTitle: undefined,
  readmeTitle: undefined,
};

const apps: string[] = [];

export default function pluginDocusaurus(
  context: LoadContext,
  opts: Partial<PluginOptions>,
) {
  const { siteDir } = context;

  /**
   * Configure options
   */
  const options = {
    ...DEFAULT_PLUGIN_OPTIONS,
    ...opts,
    ...(opts.sidebar && {
      sidebar: {
        ...DEFAULT_PLUGIN_OPTIONS.sidebar,
        ...opts.sidebar,
      },
    }),
  };

  const sidebarPath = options.sidebar
    ? path.resolve(siteDir, options.sidebar.sidebarFile)
    : null;
  if (sidebarPath) {
    fs.outputFileSync(sidebarPath, `module.exports = [];`);
  }

  return {
    name: 'docusaurus-plugin-typedoc',
    async loadContent() {
      // Initialize and build app
      if (!apps.includes(options.id)) {
        apps.push(options.id);
        const app = new Application();

        app.logger.log(
          '[docusaurus-plugin-typedoc] Starting docusaurus-plugin-markdown',
        );

        app.options.addReader(new TypeDocReader());
        app.options.addReader(new TSConfigReader());

        // TypeDoc options
        const typedocOptions = Object.keys(options).reduce((option, key) => {
          if (
            ![...['id'], ...Object.keys(DEFAULT_PLUGIN_OPTIONS)].includes(key)
          ) {
            option[key] = options[key];
          }
          return option;
        }, {});

        // bootstrap TypeDoc app
        app.bootstrap({
          // filtered TypeDoc options
          ...typedocOptions,

          // TypeDoc plugins
          plugin: [
            'typedoc-plugin-markdown',
            path.resolve(__dirname, 'typedoc-plugin-docusaurus'),
          ],
          theme: path.resolve(__dirname, 'theme'),
        });

        // configure options

        app.options.setValue('siteDir', siteDir);
        app.options.setValue('outFolder', options.out);
        app.options.setValue('readmeTitle', options.readmeTitle);
        app.options.setValue('globalsTitle', options.globalsTitle);
        if (options.sidebar) {
          app.options.setValue('sidebarFile', options.sidebar.sidebarFile);
        }

        // return the generated reflections
        const project = app.convert();

        // if project is undefined typedoc has a problem - error logging will be supplied by typedoc.
        if (!project) {
          return;
        }

        // construct outputDirectory path
        const outputDirectory = path.resolve(
          siteDir,
          options.docsRoot,
          options.out,
        );

        // generate the static docs

        await app.generateDocs(project, outputDirectory);

        // Activate markdown theme
        /*
        app.renderer.theme = app.renderer.addComponent(
          'theme',
          new MarkdownTheme(
            app.renderer,
            path.dirname(
              require.resolve('typedoc-plugin-markdown/dist/theme.js'),
            ),
          ),
        );
        app.renderer.theme!.resources.activate();

        // generate the static docs
        const output = new RendererEvent(
          RendererEvent.BEGIN,
          outputDirectory,
          project,
        );
        output.settings = app.renderer.application.options.getRawValues();
        output.urls = app.renderer.theme!.getUrls(project);

        app.renderer.trigger(output);

        if (!output.isDefaultPrevented) {
          output.urls?.forEach((mapping: UrlMapping) => {
            renderDocument(app, output.createPageEvent(mapping));
          });

          app.renderer.trigger(RendererEvent.END, output);
        }

        if (app.logger.hasErrors()) {
          this.logger.error(
            '[docusaurus-plugin-typedoc] TypeDoc threw an error. Please refer to logs for detauls',
          );
        } else {
          app.logger.success(
            '[docusaurus-plugin-typedoc] TypeDoc pages generated at %s',
            outputDirectory,
          );
        }*/
      }
    },
  };
}

/*
function renderDocument(app, page: PageEvent): boolean {
  app.renderer.trigger(PageEvent.BEGIN, page);
  if (page.isDefaultPrevented) {
    return false;
  }

  // Theme must be set as this is only called in render, and render ensures theme is set.
  page.template =
    page.template ||
    app.renderer
      .theme!.resources.templates.getResource(page.templateName)!
      .getTemplate();
  page.contents = page.template
    ? page.template(page, {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true,
      })
    : '';

  app.renderer.trigger(PageEvent.END, page);
  if (page.isDefaultPrevented) {
    return false;
  }

  try {
    writeFile(page.filename, page.contents, false);
  } catch (error) {
    this.application.logger.error('Could not write %s', page.filename);
    return false;
  }

  return true;
}
*/
