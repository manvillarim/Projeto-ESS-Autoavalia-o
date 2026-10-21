import { Conceito } from './conceito';
import { StatusDeAutoavaliacao } from './statusdeautoavaliacao';

// Entity: a auto-avaliação de um aluno em uma turma. Guarda, para cada meta, o
// conceito que o próprio aluno se atribuiu. A estrutura usada para guardar os
// conceitos é escondida dos clientes, que só a manipulam meta a meta.
export class Autoavaliacao {
  private conceitos: { [meta: string]: Conceito } = {};

  registrar(meta: string, conceito: Conceito): void {
    this.conceitos[meta] = conceito;
  }

  // Devolve true quando havia um conceito a remover, e false caso contrário,
  // para que o cliente possa distinguir as duas situações.
  remover(meta: string): boolean {
    if (!this.possuiConceitoPara(meta)) return false;
    delete this.conceitos[meta];
    return true;
  }

  possuiConceitoPara(meta: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.conceitos, meta);
  }

  conceitoDe(meta: string): Conceito {
    return this.possuiConceitoPara(meta) ? this.conceitos[meta] : null;
  }

  metasAvaliadas(): string[] {
    return Object.keys(this.conceitos);
  }

  estaVazia(): boolean {
    return this.metasAvaliadas().length === 0;
  }

  // A situação depende das metas da turma, que a auto-avaliação não conhece,
  // por isso elas são recebidas como parâmetro.
  statusPara(metas: string[]): StatusDeAutoavaliacao {
    var avaliadas: number = metas.filter(meta => this.possuiConceitoPara(meta)).length;
    if (avaliadas === 0) return StatusDeAutoavaliacao.PENDENTE;
    if (avaliadas === metas.length) return StatusDeAutoavaliacao.CONCLUIDA;
    return StatusDeAutoavaliacao.EM_ANDAMENTO;
  }
}