import { Before, Given } from '@badeball/cypress-cucumber-preprocessor';
import { paginaDeAutoavaliacao as pagina } from '../../support/pagina-de-autoavaliacao';

// Estes são testes de GUI: eles exercitam a página sozinha, com o servidor
// substituído por um dublê controlado pelo teste. Assim cada cenário parte do
// estado que descreve, sem depender do que outro cenário deixou gravado.

interface EstadoDaTurma {
  turma: string;
  metas: string[];
  conceitos: { [meta: string]: string | null };
  aberta: boolean;
}

const CONCEITOS_ACEITOS = ['MA', 'MPA', 'MANA'];

let estado: EstadoDaTurma;
let alunoLogado: string;
let paginaAberta: boolean;

Before(() => {
  estado = { turma: '', metas: [], conceitos: {}, aberta: true };
  alunoLogado = '';
  paginaAberta = false;
});

// Repete as respostas do servidor de auto-avaliações, inclusive as recusas,
// para que a página possa ser exercitada sem ele. O teste de integração é
// que confirma que o servidor de verdade responde dessa mesma forma.
function dubleDoServidor(): void {
  cy.intercept(
    { method: 'GET', url: /\/autoavaliacao\/[^/]+$/ },
    (requisicao) => requisicao.reply({ body: estado }),
  );

  cy.intercept(
    { method: 'PUT', url: /\/autoavaliacao\/[^/]+$/ },
    (requisicao) => {
      const meta: string = requisicao.body.meta;
      const conceito: string = requisicao.body.conceito;
      if (!estado.aberta) {
        return requisicao.reply(400, {
          failure: `A auto-avaliação de "${estado.turma}" está encerrada`,
        });
      }
      if (!estado.metas.includes(meta)) {
        return requisicao.reply(400, {
          failure: `A meta "${meta}" não pertence a "${estado.turma}"`,
        });
      }
      if (!CONCEITOS_ACEITOS.includes(conceito)) {
        const aceitos = CONCEITOS_ACEITOS.join(', ');
        return requisicao.reply(400, {
          failure:
            `"${conceito}" não é um conceito válido; ` +
            `os conceitos aceitos são ${aceitos}`,
        });
      }
      estado.conceitos[meta] = conceito;
      return requisicao.reply({
        body: { success: 'A auto-avaliação foi atualizada com sucesso' },
      });
    },
  );

  cy.intercept(
    { method: 'DELETE', url: /\/autoavaliacao\/[^/]+\/.+$/ },
    (requisicao) => {
      const meta = decodeURIComponent(
        requisicao.url.split('/').pop() as string,
      );
      if (!estado.aberta) {
        return requisicao.reply(400, {
          failure: `A auto-avaliação de "${estado.turma}" está encerrada`,
        });
      }
      estado.conceitos[meta] = null;
      return requisicao.reply({
        body: { success: 'A auto-avaliação foi atualizada com sucesso' },
      });
    },
  );
}

// Quando o estado da turma muda com a página já aberta, ela é recarregada,
// para que o aluno veja a tela que o cenário descreve antes de agir sobre ela.
function refletirNaPagina(): void {
  if (paginaAberta) cy.reload();
}

Given(
  'I am logged in as the student {string}, enrolled in the class {string}',
  (aluno: string, turma: string) => {
    estado.turma = turma;
    alunoLogado = aluno;
    dubleDoServidor();
  },
);

Given(
  'the class {string} has only the learning goals {string} and {string}',
  (_turma: string, primeira: string, segunda: string) => {
    estado.metas = [primeira, segunda];
    estado.conceitos = { [primeira]: null, [segunda]: null };
    refletirNaPagina();
  },
);

Given('the self-assessment of {string} is open', () => {
  estado.aberta = true;
  refletirNaPagina();
});

Given('the self-assessment of {string} is closed', () => {
  estado.aberta = false;
  refletirNaPagina();
});

Given(
  'I am on the {string} page of {string}',
  (_pagina: string, turma: string) => {
    pagina.visitar();
    paginaAberta = true;
    pagina.turma().should('have.text', turma);
    pagina.aluno().should('have.text', alunoLogado);
  },
);

Given('I have no concept registered for the goal {string}', (meta: string) => {
  estado.conceitos[meta] = null;
  refletirNaPagina();
  pagina.conceitoRegistrado(meta).should('have.text', '');
});

Given(
  'I have the concept {string} registered for the goal {string}',
  (conceito: string, meta: string) => {
    estado.conceitos[meta] = conceito;
    refletirNaPagina();
    pagina.conceitoRegistrado(meta).should('have.text', conceito);
  },
);
