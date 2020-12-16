import { PageEvent } from 'typedoc/dist/lib/output/events';

import { reflectionTitle } from '../resources/helpers/reflection-title';
import { breadcrumbsTemplate } from './breadcrumbs';

export const reflectionTemplate = (page: PageEvent) => `
${breadcrumbsTemplate(page)}

# ${reflectionTitle.call(page, true)}

${console.log(page.model.hasComment())}

`;
