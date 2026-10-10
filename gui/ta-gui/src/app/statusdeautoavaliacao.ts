// Value object: a situação da auto-avaliação de um aluno em uma turma. Só
// existem três valores possíveis, criados aqui, e dois status com o mesmo
// valor são indistinguíveis.
export class StatusDeAutoavaliacao {
  static readonly PENDENTE = new StatusDeAutoavaliacao("Pending");
  static readonly EM_ANDAMENTO = new StatusDeAutoavaliacao("In progress");
  static readonly CONCLUIDA = new StatusDeAutoavaliacao("Completed");

  private constructor(private readonly descricao: string) {}

  toString(): string {
    return this.descricao;
  }
}