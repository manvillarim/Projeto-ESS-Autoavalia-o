// Os seletores da página de auto-avaliação ficam reunidos aqui, e não nas
// definições de passos, para que uma mudança no HTML da página seja corrigida
// em um único lugar.
export const paginaDeAutoavaliacao = {
  visitar: () => cy.visit('/'),

  aluno: () => cy.get('[data-cy=student-name]'),
  turma: () => cy.get('[data-cy=class-name]'),
  metas: () => cy.get('[data-cy=goal-name]'),
  confirmacao: () => cy.get('[data-cy=confirmation-message]'),
  erro: () => cy.get('[data-cy=error-message]'),

  linhaDaMeta: (meta: string) => cy.get(`[data-cy-goal="${meta}"]`),

  conceitoRegistrado: (meta: string) =>
    paginaDeAutoavaliacao
      .linhaDaMeta(meta)
      .find('[data-cy=registered-concept]'),

  atribuirConceito: (meta: string, conceito: string) =>
    paginaDeAutoavaliacao
      .linhaDaMeta(meta)
      .find('[data-cy=concept-input]')
      .clear()
      .type(conceito),

  removerConceito: (meta: string) =>
    paginaDeAutoavaliacao
      .linhaDaMeta(meta)
      .find('[data-cy=remove-concept]')
      .click(),

  salvar: () => cy.get('[data-cy=save-self-assessment]').click(),
};
