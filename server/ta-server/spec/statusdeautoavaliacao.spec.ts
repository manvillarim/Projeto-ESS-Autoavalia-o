import { CadastroDeAutoavaliacoes } from '../cadastrodeautoavaliacoes';
import { StatusDeAutoavaliacao } from '../../../gui/ta-gui/src/app/statusdeautoavaliacao';
import { Turma } from '../../../gui/ta-gui/src/app/turma';

// Dados das metas usados pelos cenários da feature self-assessment-status.
var ESPECIFICAR: string = "Specify requirements with quality";
var TESTES: string = "Write quality tests";
var CPF_ANA: string = "111";
var CPF_BRUNO: string = "222";
var CPF_CARLA: string = "333";

describe("O status da auto-avaliação", () => {
  var cadastro: CadastroDeAutoavaliacoes;

  beforeEach(() => {
    cadastro = new CadastroDeAutoavaliacoes(new Turma("Turma A", [ESPECIFICAR, TESTES]));
  })

  it("é concluída quando o aluno atribuiu conceito a todas as metas", () => {
    cadastro.registrarConceito(CPF_ANA, ESPECIFICAR, "MA");
    cadastro.registrarConceito(CPF_ANA, TESTES, "MPA");

    expect(cadastro.statusDe(CPF_ANA)).toBe(StatusDeAutoavaliacao.CONCLUIDA);
  })

  it("é pendente quando o aluno não atribuiu nenhum conceito", () => {
    expect(cadastro.statusDe(CPF_BRUNO)).toBe(StatusDeAutoavaliacao.PENDENTE);
  })

  it("está em andamento quando só parte das metas tem conceito", () => {
    cadastro.registrarConceito(CPF_CARLA, TESTES, "MA");

    expect(cadastro.statusDe(CPF_CARLA)).toBe(StatusDeAutoavaliacao.EM_ANDAMENTO);
  })

  it("não cria uma auto-avaliação só por consultar o status", () => {
    cadastro.statusDe(CPF_BRUNO);

    expect(cadastro.autoavaliacaoDe(CPF_BRUNO).estaVazia()).toBe(true);
  })


  it("passa a concluída quando o aluno atribui conceito à última meta", () => {
    cadastro.registrarConceito(CPF_ANA, ESPECIFICAR, "MA");
    expect(cadastro.statusDe(CPF_ANA)).toBe(StatusDeAutoavaliacao.EM_ANDAMENTO);

    cadastro.registrarConceito(CPF_ANA, TESTES, "MPA");

    expect(cadastro.statusDe(CPF_ANA)).toBe(StatusDeAutoavaliacao.CONCLUIDA);
  })

  it("volta a ficar em andamento quando um conceito é removido", () => {
    cadastro.registrarConceito(CPF_ANA, ESPECIFICAR, "MA");
    cadastro.registrarConceito(CPF_ANA, TESTES, "MPA");

    cadastro.removerConceito(CPF_ANA, TESTES);

    expect(cadastro.statusDe(CPF_ANA)).toBe(StatusDeAutoavaliacao.EM_ANDAMENTO);
  })

  it("é mantido depois que a auto-avaliação é encerrada", () => {
    cadastro.registrarConceito(CPF_ANA, ESPECIFICAR, "MA");
    cadastro.registrarConceito(CPF_ANA, TESTES, "MPA");

    cadastro.getTurma().fecharAutoavaliacao();

    expect(cadastro.statusDe(CPF_ANA)).toBe(StatusDeAutoavaliacao.CONCLUIDA);
    expect(cadastro.statusDe(CPF_BRUNO)).toBe(StatusDeAutoavaliacao.PENDENTE);
  })
})