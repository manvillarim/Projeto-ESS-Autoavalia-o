import { After, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { paginaDeAutoavaliacao as pagina } from '../../support/pagina-de-autoavaliacao';

// Guarda a tela como ela ficou ao fim de cada cenário, para que a execução
// deixe evidência do que o aluno viu, e não apenas o relatório de texto.
After(() => {
  cy.screenshot({ capture: 'viewport' });
});

// Passos que descrevem o que o aluno faz e vê na página de auto-avaliação.
// Valem tanto para os testes de GUI, que isolam a página do servidor, quanto
// para o teste de integração, que usa o servidor de verdade.

When(
  'I assign the concept {string} to the goal {string}',
  (conceito: string, meta: string) => {
    pagina.atribuirConceito(meta, conceito);
  },
);

When('I remove the concept of the goal {string}', (meta: string) => {
  pagina.removerConceito(meta);
});

When('I save my self-assessment', () => {
  pagina.salvar();
});

Then('I see a confirmation message that my self-assessment was saved', () => {
  pagina.confirmacao().should('be.visible');
});

Then(
  'I see the concept {string} registered for the goal {string}',
  (conceito: string, meta: string) => {
    pagina.conceitoRegistrado(meta).should('have.text', conceito);
  },
);

Then(
  'I do not see the concept {string} registered for the goal {string}',
  (conceito: string, meta: string) => {
    pagina.conceitoRegistrado(meta).should('not.have.text', conceito);
  },
);

Then('I see the goal {string} with no concept registered', (meta: string) => {
  pagina.conceitoRegistrado(meta).should('have.text', '');
});

Then(
  'I see an error message stating that {string} is not a valid concept',
  (conceito: string) => {
    pagina
      .erro()
      .should('be.visible')
      .and('contain', conceito)
      .and('contain', 'não é um conceito válido');
  },
);

Then(
  'I see that the accepted concepts are {string}, {string} and {string}',
  (primeiro: string, segundo: string, terceiro: string) => {
    pagina.erro().should('contain', [primeiro, segundo, terceiro].join(', '));
  },
);

Then(
  'I see an error message stating that the self-assessment of {string} is closed',
  (turma: string) => {
    pagina
      .erro()
      .should('be.visible')
      .and('contain', turma)
      .and('contain', 'está encerrada');
  },
);
