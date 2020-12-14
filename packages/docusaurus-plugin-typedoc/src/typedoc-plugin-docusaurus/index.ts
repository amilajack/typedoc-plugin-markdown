import { Application, ParameterType } from 'typedoc';

import { FrontMatterComponent } from './components/front-matter';
import { SidebarComponent } from './components/sidebar';

export = (PluginHost: Application) => {
  const app = PluginHost.owner;

  app.options.addDeclaration({
    help: '',
    name: 'siteDir',
    type: ParameterType.String,
  });

  app.options.addDeclaration({
    help: '',
    name: 'outFolder',
    type: ParameterType.String,
  });

  app.options.addDeclaration({
    help: '',
    name: 'globalsTitle',
    type: ParameterType.String,
  });

  app.options.addDeclaration({
    help: '',
    name: 'readmeTitle',
    type: ParameterType.String,
  });

  app.options.addDeclaration({
    help: '',
    name: 'sidebarFile',
    type: ParameterType.String,
  });

  app.renderer.addComponent(
    'front-matter',
    new FrontMatterComponent(app.renderer),
  );

  app.renderer.addComponent('sidebar', new SidebarComponent(app.renderer));
};
