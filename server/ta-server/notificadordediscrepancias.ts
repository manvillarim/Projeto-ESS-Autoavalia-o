import { AnaliseDeDiscrepancias } from './analisedediscrepancias';
import { TurmaMatriculada } from './cadastrodeturmas';

// Aviso de que um aluno passou a ter discrepância acima do limiar da turma.
export class Notificacao {
  constructor(readonly cpf: string, readonly nome: string, readonly discrepancia: number, readonly mensagem: string) {}
}

// Avisa o professor inscrito sobre os alunos que se tornaram discrepantes desde o último
// cálculo. Quem já era discrepante quando o professor se inscreveu, ou no cálculo anterior,
// não é novidade; quem deixa de ser discrepante e volta a ser, é.
export class NotificadorDeDiscrepancias {
  private inscrito: boolean = false;
  private conhecidos: { [cpf: string]: boolean } = {};
  private notificacoes: Notificacao[] = [];
  private readonly analise: AnaliseDeDiscrepancias;

  constructor(private readonly turma: TurmaMatriculada) {
    this.analise = new AnaliseDeDiscrepancias(turma);
  }

  inscrever(): void {
    this.inscrito = true;
    this.conhecidos = this.cpfsDosDiscrepantes();
  }

  // Recalcula as discrepâncias da turma e devolve as notificações geradas por esse cálculo.
  recalcular(): Notificacao[] {
    var atuais: { [cpf: string]: boolean } = this.cpfsDosDiscrepantes();
    var novas: Notificacao[] = [];
    if (this.inscrito) {
      var limiar: number = this.turma.getTurma().getLimiarDeDiscrepancia();
      for (var discrepante of this.analise.relatorio().discrepantes) {
        if (this.conhecidos[discrepante.aluno.cpf]) continue;
        novas.push(new Notificacao(discrepante.aluno.cpf, discrepante.aluno.nome, discrepante.discrepancia,
                                   'O aluno "' + discrepante.aluno.nome + '" passou a ser discrepante: discrepância '
                                   + discrepante.discrepancia + ', acima do limiar de ' + limiar));
      }
    }
    this.conhecidos = atuais;
    this.notificacoes = this.notificacoes.concat(novas);
    return novas;
  }

  getNotificacoes(): Notificacao[] {
    return this.notificacoes.slice();
  }

  private cpfsDosDiscrepantes(): { [cpf: string]: boolean } {
    var cpfs: { [cpf: string]: boolean } = {};
    for (var discrepante of this.analise.relatorio().discrepantes) cpfs[discrepante.aluno.cpf] = true;
    return cpfs;
  }
}
