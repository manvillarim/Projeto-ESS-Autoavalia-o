import { AnaliseDeDiscrepancias } from '../analisedediscrepancias';
import { TurmaMatriculada } from '../cadastrodeturmas';
import { Turma } from '../../../gui/ta-gui/src/app/turma';

var ESPECIFICAR: string = "Specify requirements with quality";
var TESTES: string = "Write quality tests";

describe("A análise de discrepâncias", () => {
  var turma: Turma;
  var matriculada: TurmaMatriculada;
  var analise: AnaliseDeDiscrepancias;

  // Atribui, nesta ordem, os conceitos às duas metas da turma.
  function atribuir(quem: "professor" | "aluno", cpf: string, conceitos: string[]): void {
    var cadastro = quem === "professor" ? matriculada.getConceitosDoProfessor() : matriculada.getAutoavaliacoes();
    cadastro.registrarConceito(cpf, ESPECIFICAR, conceitos[0]);
    cadastro.registrarConceito(cpf, TESTES, conceitos[1]);
  }

  beforeEach(() => {
    turma = new Turma("Turma A", [ESPECIFICAR, TESTES]);
    turma.definirLimiarDeDiscrepancia(1);
    matriculada = new TurmaMatriculada(turma);
    analise = new AnaliseDeDiscrepancias(matriculada);
    matriculada.matricular("Carlos", "1");
    matriculada.matricular("Beatriz", "2");
    matriculada.matricular("Rafael", "3");
    atribuir("professor", "1", ["MANA", "MANA"]); atribuir("aluno", "1", ["MA", "MA"]);
    atribuir("professor", "2", ["MA", "MPA"]);    atribuir("aluno", "2", ["MA", "MPA"]);
    atribuir("professor", "3", ["MPA", "MANA"]);  atribuir("aluno", "3", ["MA", "MPA"]);
  })

  it("soma as divergências de todas as metas da turma", () => {
    expect(analise.discrepanciaDe("1").getValor()).toBe(4);
    expect(analise.discrepanciaDe("2").getValor()).toBe(0);
    expect(analise.discrepanciaDe("3").getValor()).toBe(2);
  })

  it("lista só os alunos com discrepância acima do limiar", () => {
    var relatorio = analise.relatorio();

    expect(relatorio.discrepantes.map(d => d.aluno.nome)).toEqual(["Carlos", "Rafael"]);
    expect(relatorio.discrepantes.map(d => d.discrepancia)).toEqual([4, 2]);
    expect(relatorio.quantidadeDeDiscrepantes()).toBe(2);
    expect(relatorio.percentualDeDiscrepantes()).toBe(67);
  })

  it("informa os conceitos de cada meta do aluno discrepante", () => {
    var carlos = analise.relatorio().discrepantes[0];

    expect(carlos.conceitosDoProfessor[ESPECIFICAR]).toBe("MANA");
    expect(carlos.conceitosDoAluno[ESPECIFICAR]).toBe("MA");
  })

  describe("quando nenhum aluno excede o limiar", () => {
    beforeEach(() => {
      turma.definirLimiarDeDiscrepancia(4);
    })

    it("devolve a lista de discrepantes vazia, com contagem e percentual zerados", () => {
      var relatorio = analise.relatorio();

      expect(relatorio.discrepantes).toEqual([]);
      expect(relatorio.quantidadeDeDiscrepantes()).toBe(0);
      expect(relatorio.percentualDeDiscrepantes()).toBe(0);
      expect(relatorio.totalDeAlunos).toBe(3);
    })
  })

  describe("quando falta algum conceito para calcular a discrepância", () => {
    beforeEach(() => {
      matriculada.matricular("Maria", "4");
      atribuir("aluno", "4", ["MA", "MA"]);
    })

    it("não calcula a discrepância de aluno sem conceitos do professor, e explica o motivo", () => {
      var discrepancia = analise.discrepanciaDe("4");

      expect(discrepancia.foiCalculada()).toBe(false);
      expect(discrepancia.getMotivo()).toContain("professor");
    })

    it("não calcula a discrepância de aluno que não atribuiu conceito a alguma meta", () => {
      matriculada.matricular("Joana", "5");
      matriculada.getConceitosDoProfessor().registrarConceito("5", ESPECIFICAR, "MA");
      matriculada.getAutoavaliacoes().registrarConceito("5", TESTES, "MA");

      expect(analise.discrepanciaDe("5").getMotivo()).toContain("aluno");
    })

    it("não conta o aluno como discrepante, mas o inclui no total da turma", () => {
      var relatorio = analise.relatorio();

      expect(relatorio.naoCalculaveis.map(n => n.aluno.nome)).toEqual(["Maria"]);
      expect(relatorio.discrepantes.map(d => d.aluno.nome)).toEqual(["Carlos", "Rafael"]);
      expect(relatorio.totalDeAlunos).toBe(4);
      expect(relatorio.percentualDeDiscrepantes()).toBe(50);
    })
  })

  describe("quando a discrepância é exatamente igual ao limiar", () => {
    beforeEach(() => {
      turma.definirLimiarDeDiscrepancia(2);
      matriculada.matricular("João", "6");
      atribuir("professor", "6", ["MPA", "MANA"]); atribuir("aluno", "6", ["MA", "MPA"]);
    })

    it("não considera o aluno discrepante", () => {
      expect(analise.discrepanciaDe("6").getValor()).toBe(2);
      expect(analise.relatorio().discrepantes.map(d => d.aluno.nome)).not.toContain("João");
    })

    it("passa a considerar o aluno discrepante quando o limiar diminui", () => {
      turma.definirLimiarDeDiscrepancia(1);

      expect(analise.relatorio().discrepantes.map(d => d.aluno.nome)).toContain("João");
    })
  })
})
