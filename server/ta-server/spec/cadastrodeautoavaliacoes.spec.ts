import { CadastroDeAutoavaliacoes } from '../cadastrodeautoavaliacoes';
import { Turma } from '../../../gui/ta-gui/src/app/turma';

// Dados das metas usados pelos cenários da feature student-grade-management.
var ESPECIFICAR: string = "Specify requirements with quality";
var TESTES: string = "Write quality tests";
var CPF_BRUNO: string = "683";

describe("O cadastro de auto-avaliações", () => {
  var turma: Turma;
  var cadastro: CadastroDeAutoavaliacoes;

  beforeEach(() => {
    turma = new Turma("ESS 2025.1", [ESPECIFICAR, TESTES]);
    cadastro = new CadastroDeAutoavaliacoes(turma);
  })

  it("começa sem nenhum conceito registrado para o aluno", () => {
    expect(cadastro.autoavaliacaoDe(CPF_BRUNO).estaVazia()).toBe(true);
  })

  it("registra o conceito de uma meta que ainda não tinha conceito", () => {
    var resultado = cadastro.registrarConceito(CPF_BRUNO, ESPECIFICAR, "MPA");

    expect(resultado.sucedeu()).toBe(true);
    expect(cadastro.autoavaliacaoDe(CPF_BRUNO).conceitoDe(ESPECIFICAR).toString()).toBe("MPA");
    expect(cadastro.autoavaliacaoDe(CPF_BRUNO).possuiConceitoPara(TESTES)).toBe(false);
  })

  it("atualiza o conceito de uma meta que já tinha conceito", () => {
    cadastro.registrarConceito(CPF_BRUNO, TESTES, "MANA");

    var resultado = cadastro.registrarConceito(CPF_BRUNO, TESTES, "MA");

    expect(resultado.sucedeu()).toBe(true);
    expect(cadastro.autoavaliacaoDe(CPF_BRUNO).conceitoDe(TESTES).toString()).toBe("MA");
    expect(cadastro.autoavaliacaoDe(CPF_BRUNO).metasAvaliadas().length).toBe(1);
  })

  it("mantém separadas as auto-avaliações de alunos diferentes", () => {
    cadastro.registrarConceito(CPF_BRUNO, ESPECIFICAR, "MA");
    cadastro.registrarConceito("962", ESPECIFICAR, "MANA");

    expect(cadastro.autoavaliacaoDe(CPF_BRUNO).conceitoDe(ESPECIFICAR).toString()).toBe("MA");
    expect(cadastro.autoavaliacaoDe("962").conceitoDe(ESPECIFICAR).toString()).toBe("MANA");
  })

})
