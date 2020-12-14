#!/usr/bin/env node

const {
  ArgumentsReader,
  TSConfigReader,
  TypeDocReader,
  ParameterType,
} = require('typedoc');

const { MarkdownApplication } = require('../dist/application');

const ExitCodes = {
  Ok: 0,
  OptionError: 1,
  NoEntryPoints: 2,
  CompileError: 3,
  OutputError: 4,
};

const app = new MarkdownApplication();

app.options.addReader(new ArgumentsReader(0));
app.options.addReader(new TypeDocReader());
app.options.addReader(new TSConfigReader());
app.options.addReader(new ArgumentsReader(300));

app.bootstrap();

run(app)
  .then(process.exit)
  .catch((error) => {
    console.error('TypeDoc exiting with unexpected error:');
    console.error(error);
  });

async function run(app) {
  if (app.logger.hasErrors()) {
    return ExitCodes.OptionError;
  }

  if (app.options.getValue('entryPoints').length === 0) {
    app.logger.error('No entry points provided');
    return ExitCodes.NoEntryPoints;
  }

  const project = app.convert();
  if (!project) {
    return ExitCodes.CompileError;
  }

  const out = app.options.getValue('out');
  if (out) {
    await app.generateDocs(project, out);
  }

  if (app.logger.hasErrors()) {
    return ExitCodes.OutputError;
  }
  return ExitCodes.Ok;
}
