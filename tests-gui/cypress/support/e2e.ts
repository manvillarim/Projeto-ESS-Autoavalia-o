// Carregado antes de cada arquivo de teste. O servidor de desenvolvimento do
// Angular injeta um cliente de recarga automática que pode falhar durante a
// execução dos testes; essa falha não diz nada sobre a aplicação, então não
// deve reprovar o teste.
Cypress.on(
  'uncaught:exception',
  (erro) => !/vite|hmr|dynamically imported module/i.test(erro.message),
);
