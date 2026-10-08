import { Discrepancia } from '../../gui/ta-gui/src/app/discrepancia';
import { Autoavaliacao } from '../../gui/ta-gui/src/app/autoavaliacao';
import { Matriculado, TurmaMatriculada } from './cadastrodeturmas';

// Um aluno discrepante, com os dados que o professor precisa para entender a discrepância.
export class AlunoDiscrepante {
  constructor(readonly aluno: Matriculado,
              readonly discrepancia: number,
              readonly conceitosDoProfessor: { [meta: string]: string },
              readonly conceitosDoAluno: { [meta: string]: string }) {}
}

// Um aluno cuja discrepância não pôde ser calculada, e o motivo.
export class AlunoSemDiscrepancia {
  constructor(readonly aluno: Matriculado, readonly motivo: string) {}
}

// Quantos alunos têm uma dada discrepância.
export class FaixaDeDiscrepancia {
  constructor(readonly discrepancia: number, readonly quantidade: number) {}
}

export class RelatorioDeDiscrepancias {
  constructor(readonly turma: string,
              readonly limiar: number,
              readonly totalDeAlunos: number,
              readonly discrepantes: AlunoDiscrepante[],
              readonly naoCalculaveis: AlunoSemDiscrepancia[]) {}

  // Do aluno com maior discrepância para o de menor; em empate, por nome, para que a ordem seja determinística.
  ordenadoPorDiscrepanciaDecrescente(): RelatorioDeDiscrepancias {
    var ordenados: AlunoDiscrepante[] = this.discrepantes.slice().sort((a, b) =>
        (b.discrepancia - a.discrepancia) || a.aluno.nome.localeCompare(b.aluno.nome));
    return new RelatorioDeDiscrepancias(this.turma, this.limiar, this.totalDeAlunos, ordenados, this.naoCalculaveis);
  }

  quantidadeDeDiscrepantes(): number {
    return this.discrepantes.length;
  }

  // Percentual em relação a todos os alunos da turma, inclusive os sem discrepância calculável.
  percentualDeDiscrepantes(): number {
    if (this.totalDeAlunos === 0) return 0;
    return Math.round(100 * this.discrepantes.length / this.totalDeAlunos);
  }
}

// Calcula, para uma turma, quais alunos se avaliaram de forma muito diferente do professor.
export class AnaliseDeDiscrepancias {
  constructor(private readonly turma: TurmaMatriculada) {}

  // A discrepância é a soma das divergências de todas as metas da turma.
  discrepanciaDe(cpf: string): Discrepancia {
    var metas: string[] = this.turma.getTurma().getMetas();
    var doProfessor: Autoavaliacao = this.turma.getConceitosDoProfessor().autoavaliacaoDe(cpf);
    var doAluno: Autoavaliacao = this.turma.getAutoavaliacoes().autoavaliacaoDe(cpf);

    var soma: number = 0;
    for (var meta of metas) {
      if (!doProfessor.possuiConceitoPara(meta)) {
        return Discrepancia.naoCalculavel('O professor não atribuiu conceito à meta "' + meta + '"');
      }
      if (!doAluno.possuiConceitoPara(meta)) {
        return Discrepancia.naoCalculavel('O aluno não atribuiu conceito à meta "' + meta + '"');
      }
      soma += doAluno.conceitoDe(meta).divergenciaPara(doProfessor.conceitoDe(meta));
    }
    return Discrepancia.de(soma);
  }

  relatorio(): RelatorioDeDiscrepancias {
    var limiar: number = this.turma.getTurma().getLimiarDeDiscrepancia();
    var discrepantes: AlunoDiscrepante[] = [];
    var naoCalculaveis: AlunoSemDiscrepancia[] = [];
    var matriculados: Matriculado[] = this.turma.getMatriculados();

    for (var aluno of matriculados) {
      var discrepancia: Discrepancia = this.discrepanciaDe(aluno.cpf);
      if (!discrepancia.foiCalculada()) {
        naoCalculaveis.push(new AlunoSemDiscrepancia(aluno, discrepancia.getMotivo()));
      } else if (discrepancia.excede(limiar)) {
        discrepantes.push(new AlunoDiscrepante(aluno, discrepancia.getValor(),
                                               this.conceitosDe(this.turma.getConceitosDoProfessor().autoavaliacaoDe(aluno.cpf)),
                                               this.conceitosDe(this.turma.getAutoavaliacoes().autoavaliacaoDe(aluno.cpf))));
      }
    }
    return new RelatorioDeDiscrepancias(this.turma.getTurma().getNome(), limiar,
                                        matriculados.length, discrepantes, naoCalculaveis);
  }

  // Número de alunos da turma por valor de discrepância, de 0 até a maior discrepância,
  // inclusive os valores sem nenhum aluno. Alunos sem discrepância calculável ficam de fora.
  distribuicao(): FaixaDeDiscrepancia[] {
    var quantidades: number[] = [];
    for (var aluno of this.turma.getMatriculados()) {
      var discrepancia: Discrepancia = this.discrepanciaDe(aluno.cpf);
      if (!discrepancia.foiCalculada()) continue;
      while (quantidades.length <= discrepancia.getValor()) quantidades.push(0);
      quantidades[discrepancia.getValor()]++;
    }
    return quantidades.map((quantidade, discrepancia) => new FaixaDeDiscrepancia(discrepancia, quantidade));
  }

  // Uma linha por aluno discrepante do relatório, com os conceitos do professor e do aluno
  // em cada meta da turma e a discrepância.
  comoCsv(relatorio: RelatorioDeDiscrepancias): string {
    var metas: string[] = this.turma.getTurma().getMetas();
    var cabecalho: string[] = ["Student", "CPF"];
    for (var meta of metas) {
      cabecalho.push("Professor: " + meta, "Student: " + meta);
    }
    cabecalho.push("Discrepancy");

    var linhas: string[][] = [cabecalho];
    for (var discrepante of relatorio.discrepantes) {
      var linha: string[] = [discrepante.aluno.nome, discrepante.aluno.cpf];
      for (var meta of metas) {
        linha.push(discrepante.conceitosDoProfessor[meta], discrepante.conceitosDoAluno[meta]);
      }
      linha.push(String(discrepante.discrepancia));
      linhas.push(linha);
    }
    return linhas.map(l => l.map(AnaliseDeDiscrepancias.campoCsv).join(",")).join("\r\n") + "\r\n";
  }

  // Campos com vírgula, aspas ou quebra de linha vão entre aspas, e as aspas internas são dobradas.
  private static campoCsv(valor: string): string {
    return /[",\r\n]/.test(valor) ? '"' + valor.replace(/"/g, '""') + '"' : valor;
  }

  private conceitosDe(autoavaliacao: Autoavaliacao): { [meta: string]: string } {
    var conceitos: { [meta: string]: string } = {};
    for (var meta of this.turma.getTurma().getMetas()) {
      conceitos[meta] = autoavaliacao.conceitoDe(meta).toString();
    }
    return conceitos;
  }
}
