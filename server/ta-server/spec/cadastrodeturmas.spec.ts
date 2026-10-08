import { TurmaMatriculada, CadastroDeTurmas } from '../cadastrodeturmas';
import { Turma } from '../../../gui/ta-gui/src/app/turma';

describe("A turma matriculada", () => {
  var turma: Turma;
  var matriculada: TurmaMatriculada;

  beforeEach(() => {
    turma = new Turma("Turma I", ["Write quality tests"]);
    turma.definirLimiarDeDiscrepancia(2);
    matriculada = new TurmaMatriculada(turma);
  })

  it("altera o limiar de discrepância da turma", () => {
    var resultado = matriculada.alterarLimiar(1);

    expect(resultado.sucedeu()).toBe(true);
    expect(turma.getLimiarDeDiscrepancia()).toBe(1);
  })

  it("aceita o limiar zero", () => {
    expect(matriculada.alterarLimiar(0).sucedeu()).toBe(true);
  })

  it("recusa limiar negativo, fracionário ou que não seja número, mantendo o limiar anterior", () => {
    [-1, 1.5, "1", null, undefined, NaN].forEach(invalido => {
      var resultado = matriculada.alterarLimiar(invalido);

      expect(resultado.sucedeu()).toBe(false);
      expect(resultado.getErro()).toContain("limiar");
    });
    expect(turma.getLimiarDeDiscrepancia()).toBe(2);
  })
})

describe("O cadastro de turmas", () => {
  it("encontra a turma pelo nome e devolve null para uma turma desconhecida", () => {
    var cadastro = new CadastroDeTurmas();
    var matriculada = new TurmaMatriculada(new Turma("Turma I"));
    cadastro.adicionar(matriculada);

    expect(cadastro.turmaDe("Turma I")).toBe(matriculada);
    expect(cadastro.turmaDe("Turma Z")).toBeNull();
    expect(cadastro.turmaDe("constructor")).toBeNull();
  })
})
