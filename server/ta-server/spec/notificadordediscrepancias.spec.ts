import { NotificadorDeDiscrepancias } from '../notificadordediscrepancias';
import { TurmaMatriculada } from '../cadastrodeturmas';
import { Turma } from '../../../gui/ta-gui/src/app/turma';

var ESPECIFICAR: string = "Specify requirements with quality";
var TESTES: string = "Write quality tests";

describe("O notificador de discrepâncias", () => {
  var turma: Turma;
  var matriculada: TurmaMatriculada;
  var notificador: NotificadorDeDiscrepancias;

  // Faz o aluno ter, nas duas metas, a divergência máxima (4 no total) em relação ao professor.
  function tornarDiscrepante(nome: string, cpf: string): void {
    matriculada.matricular(nome, cpf);
    [ESPECIFICAR, TESTES].forEach(meta => {
      matriculada.getConceitosDoProfessor().registrarConceito(cpf, meta, "MANA");
      matriculada.getAutoavaliacoes().registrarConceito(cpf, meta, "MA");
    });
  }

  beforeEach(() => {
    turma = new Turma("Turma H", [ESPECIFICAR, TESTES]);
    turma.definirLimiarDeDiscrepancia(1);
    matriculada = new TurmaMatriculada(turma);
    notificador = new NotificadorDeDiscrepancias(matriculada);
  })

  it("notifica o professor inscrito sobre o aluno que passou a ser discrepante", () => {
    notificador.inscrever();
    tornarDiscrepante("Carlos", "1");

    var novas = notificador.recalcular();

    expect(novas.map(n => n.nome)).toEqual(["Carlos"]);
    expect(novas[0].mensagem).toContain("Carlos");
    expect(notificador.getNotificacoes().length).toBe(1);
  })

  it("não notifica antes de a turma ser recalculada", () => {
    notificador.inscrever();
    tornarDiscrepante("Carlos", "1");

    expect(notificador.getNotificacoes()).toEqual([]);
  })

  it("não notifica sobre quem já era discrepante quando o professor se inscreveu", () => {
    tornarDiscrepante("Carlos", "1");
    notificador.inscrever();

    expect(notificador.recalcular()).toEqual([]);
  })

  it("não notifica duas vezes sobre o mesmo aluno", () => {
    notificador.inscrever();
    tornarDiscrepante("Carlos", "1");
    notificador.recalcular();

    expect(notificador.recalcular()).toEqual([]);
    expect(notificador.getNotificacoes().length).toBe(1);
  })

  it("não notifica quem não se inscreveu", () => {
    tornarDiscrepante("Carlos", "1");

    expect(notificador.recalcular()).toEqual([]);
  })

  it("notifica de novo quando o aluno deixa de ser discrepante e volta a ser", () => {
    notificador.inscrever();
    tornarDiscrepante("Carlos", "1");
    notificador.recalcular();
    matriculada.getAutoavaliacoes().registrarConceito("1", ESPECIFICAR, "MANA");
    matriculada.getAutoavaliacoes().registrarConceito("1", TESTES, "MANA");
    notificador.recalcular();
    matriculada.getAutoavaliacoes().registrarConceito("1", ESPECIFICAR, "MA");
    matriculada.getAutoavaliacoes().registrarConceito("1", TESTES, "MA");

    expect(notificador.recalcular().map(n => n.nome)).toEqual(["Carlos"]);
  })
})
