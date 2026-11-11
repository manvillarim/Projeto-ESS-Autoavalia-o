import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';

export default defineConfig({
  e2e: {
    // A página de auto-avaliação servida por ta-autoavaliacao.
    baseUrl: 'http://127.0.0.1:4200',
    // Os cenários de interface não são copiados para cá: o teste lê o mesmo
    // arquivo que a equipe mantém como especificação, em features/.
    specPattern: [
      '../features/student-grade-management.feature',
      'cypress/e2e/**/*.feature',
    ],
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    screenshotsFolder: 'cypress/screenshots',
    viewportWidth: 1100,
    viewportHeight: 700,
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);
      on(
        'file:preprocessor',
        createBundler({ plugins: [createEsbuildPlugin(config)] }),
      );
      return config;
    },
  },
});
