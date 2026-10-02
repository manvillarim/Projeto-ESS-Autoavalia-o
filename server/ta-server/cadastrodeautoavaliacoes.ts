import { Autoavaliacao } from '../../gui/ta-gui/src/app/autoavaliacao';
import { Conceito } from '../../gui/ta-gui/src/app/conceito';
import { Resultado } from '../../gui/ta-gui/src/app/resultado';
import { Turma } from '../../gui/ta-gui/src/app/turma';

// Repositório das auto-avaliações de uma turma, e ponto de entrada das
// operações que o aluno realiza sobre a sua própria auto-avaliação.
// A turma é injetada, e não criada aqui, para que o cadastro possa ser usado
// com qualquer turma e testado sem depender de uma turma específica.
export class CadastroDeAutoavaliacoes {
  private autoavaliacoes: { [cpf: string]: Autoavaliacao } = {};

  constructor(private readonly turma: Turma) {}

  registrarConceito(cpf: string, meta: string, conceito: string): Resultado {
    var conceitoRegistrado: Conceito = Conceito.de(conceito);
    this.autoavaliacaoDe(cpf).registrar(meta, conceitoRegistrado);
    return Resultado.sucesso();
  }

  // Devolve a auto-avaliação do aluno na turma, criando uma vazia na primeira
  // vez que o aluno a acessa, para que o cliente nunca precise tratar null.
  autoavaliacaoDe(cpf: string): Autoavaliacao {
    if (!Object.prototype.hasOwnProperty.call(this.autoavaliacoes, cpf)) {
      this.autoavaliacoes[cpf] = new Autoavaliacao();
    }
    return this.autoavaliacoes[cpf];
  }

  getTurma(): Turma {
    return this.turma;
  }
}
