# Testes de GUI e de integração

Testes automatizados de interface do teaching assistant, escritos em Gherkin e
executados com Cypress e o cypress-cucumber-preprocessor.

- `../features/student-grade-management.feature` é lido direto daqui. Os
  cenários de interface não são copiados para este diretório: o teste e a
  especificação são o mesmo arquivo.
- `cypress/e2e/self-assessment-integration.feature` é o teste de integração
  entre a página e o servidor.
- `cypress/e2e/step_definitions` tem as definições de passos, e
  `cypress/support/pagina-de-autoavaliacao.ts` reúne os seletores da página.

## Como executar

Em três terminais, a partir da raiz do projeto:

```
cd server/ta-server     && npm install && npm start
cd gui/ta-autoavaliacao && npm install && npm start
cd tests-gui            && npm install && npm test
```

O servidor sobe em `http://localhost:3000` e a página em
`http://127.0.0.1:4200`.

- `npm run test:gui` executa só os testes de GUI, que dublam o servidor.
- `npm run test:integration` executa só o teste de integração, que precisa do
  servidor no ar.
- `npm test` executa os dois e grava o relatório em
  `cypress/reports/cucumber-report.html`.

O cenário marcado com `@servico` fica de fora da execução de GUI: a página só
oferece as metas que o servidor informa para a turma, então essa regra não é
observável pela interface e é verificada no teste do servidor.
