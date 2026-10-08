import { Turma } from '../../gui/ta-gui/src/app/turma';
import { CadastroDeAutoavaliacoes } from './cadastrodeautoavaliacoes';

// Um aluno matriculado em uma turma, identificado pelo CPF.
export class Matriculado {
  constructor(readonly nome: string, readonly cpf: string) {}
}

// Stub das funcionalidades de turma e de conceitos do professor, que são de
// responsabilidade de outros membros da equipe: reúne o que a análise de
// discrepâncias precisa saber de uma turma. Os conceitos do professor reaproveitam
// o mesmo cadastro (e as mesmas regras) das auto-avaliações dos alunos.
export class TurmaMatriculada {
  private matriculados: Matriculado[] = [];
  private conceitosDoProfessor: CadastroDeAutoavaliacoes;

  constructor(private readonly turma: Turma,
              private readonly autoavaliacoes: CadastroDeAutoavaliacoes = new CadastroDeAutoavaliacoes(turma)) {
    this.conceitosDoProfessor = new CadastroDeAutoavaliacoes(turma);
  }

  matricular(nome: string, cpf: string): void {
    this.matriculados.push(new Matriculado(nome, cpf));
  }

  getMatriculados(): Matriculado[] {
    return this.matriculados.slice();
  }

  getTurma(): Turma {
    return this.turma;
  }

  getAutoavaliacoes(): CadastroDeAutoavaliacoes {
    return this.autoavaliacoes;
  }

  getConceitosDoProfessor(): CadastroDeAutoavaliacoes {
    return this.conceitosDoProfessor;
  }
}

export class CadastroDeTurmas {
  private turmas: { [nome: string]: TurmaMatriculada } = {};

  adicionar(turma: TurmaMatriculada): void {
    this.turmas[turma.getTurma().getNome()] = turma;
  }

  turmaDe(nome: string): TurmaMatriculada {
    return Object.prototype.hasOwnProperty.call(this.turmas, nome) ? this.turmas[nome] : null;
  }
}
