import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { paginaDeAutoavaliacao as pagina } from '../../support/pagina-de-autoavaliacao';

// Este é um teste de integração: nada é dublado. A página conversa com o
// servidor Express de verdade, que executa o cadastro de auto-avaliações sobre
// as classes de domínio. Ele falha se qualquer um desses módulos deixar de
// combinar com os outros, o que os testes de GUI isolados não detectam.

const SERVICO = 'http://localhost:3000';
const ALUNO = '683';

function autoavaliacaoNoServico() {
  return cy.request(`${SERVICO}/autoavaliacao/${ALUNO}`);
}

Given(
  'the student {string} has no concept registered in the self-assessment service',
  () => {
    autoavaliacaoNoServico().then((resposta) => {
      resposta.body.metas.forEach((meta: string) => {
        cy.request({
          method: 'DELETE',
          url: `${SERVICO}/autoavaliacao/${ALUNO}/${encodeURIComponent(meta)}`,
          failOnStatusCode: false,
        });
      });
    });
  },
);

Given(
  'I am on the {string} page served by the self-assessment service',
  () => {
    pagina.visitar();
    pagina.turma().should('have.text', 'ESS 2025.1');
  },
);

Then(
  'the service has the concept {string} stored for the goal {string}',
  (conceito: string, meta: string) => {
    autoavaliacaoNoServico()
      .its('body.conceitos')
      .should((conceitos) => expect(conceitos[meta]).to.equal(conceito));
  },
);

Then(
  'the service has no concept stored for the goal {string}',
  (meta: string) => {
    autoavaliacaoNoServico()
      .its('body.conceitos')
      .should((conceitos) => expect(conceitos[meta]).to.equal(null));
  },
);
