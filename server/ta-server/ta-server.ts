import express = require('express');
import bodyParser = require("body-parser");

import {Aluno} from '../../gui/ta-gui/src/app/aluno';
import {Turma} from '../../gui/ta-gui/src/app/turma';
import {Resultado} from '../../gui/ta-gui/src/app/resultado';
import {CadastroDeAlunos} from './cadastrodealunos';
import {CadastroDeAutoavaliacoes} from './cadastrodeautoavaliacoes';
import {CadastroDeTurmas, TurmaMatriculada} from './cadastrodeturmas';
import {AnaliseDeDiscrepancias} from './analisedediscrepancias';

var app = express();

var cadastro: CadastroDeAlunos = new CadastroDeAlunos();

var turma: Turma = new Turma("ESS 2025.1",
                             ["Specify requirements with quality", "Write quality tests"]);
var autoavaliacoes: CadastroDeAutoavaliacoes = new CadastroDeAutoavaliacoes(turma);

var turmas: CadastroDeTurmas = new CadastroDeTurmas();
turmas.adicionar(new TurmaMatriculada(turma, autoavaliacoes));

var allowCrossDomain = function(req: any, res: any, next: any) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
app.use(allowCrossDomain);

app.use(bodyParser.json());

app.get('/alunos', function (req, res) {
  res.send(JSON.stringify(cadastro.getAlunos()));
})

app.post('/aluno', function (req: express.Request, res: express.Response) {
  var aluno: Aluno = Aluno.criarDeDadosExternos(req.body);
  if (aluno) aluno = cadastro.criar(aluno);
  if (aluno) {
    res.send({"success": "O aluno foi cadastrado com sucesso"});
  } else {
    res.send({"failure": "O aluno não pode ser cadastrado"});
  }
})

app.put('/aluno', function (req: express.Request, res: express.Response) {
  var aluno: Aluno = Aluno.criarDeDadosExternos(req.body);
  if (aluno) aluno = cadastro.atualizar(aluno);
  if (aluno) {
    res.send({"success": "O aluno foi atualizado com sucesso"});
  } else {
    res.send({"failure": "O aluno não pode ser atualizado"});
  }
})

app.get('/autoavaliacao/:cpf', function (req: express.Request, res: express.Response) {
  var autoavaliacao = autoavaliacoes.autoavaliacaoDe(req.params.cpf);
  var conceitos: any = {};
  turma.getMetas().forEach(function (meta) {
    var conceito = autoavaliacao.conceitoDe(meta);
    conceitos[meta] = conceito ? conceito.toString() : null;
  });
  res.send({"metas": turma.getMetas(), "conceitos": conceitos,
            "aberta": turma.estaComAutoavaliacaoAberta()});
})

app.put('/autoavaliacao/:cpf', function (req: express.Request, res: express.Response) {
  responder(res, autoavaliacoes.registrarConceito(req.params.cpf, req.body.meta, req.body.conceito));
})

app.delete('/autoavaliacao/:cpf/:meta', function (req: express.Request, res: express.Response) {
  responder(res, autoavaliacoes.removerConceito(req.params.cpf, req.params.meta));
})

app.get('/turma/:nome/discrepancias', function (req: express.Request, res: express.Response) {
  var matriculada: TurmaMatriculada = turmas.turmaDe(req.params.nome);
  if (!matriculada) return turmaNaoEncontrada(res, req.params.nome);
  var relatorio = new AnaliseDeDiscrepancias(matriculada).relatorio();
  if (req.query.ordem === 'discrepancia-decrescente') relatorio = relatorio.ordenadoPorDiscrepanciaDecrescente();
  res.send({"turma": relatorio.turma, "limiar": relatorio.limiar,
            "totalDeAlunos": relatorio.totalDeAlunos,
            "quantidadeDeDiscrepantes": relatorio.quantidadeDeDiscrepantes(),
            "percentualDeDiscrepantes": relatorio.percentualDeDiscrepantes(),
            "discrepantes": relatorio.discrepantes.map(d => ({"nome": d.aluno.nome, "cpf": d.aluno.cpf,
                "discrepancia": d.discrepancia, "conceitosDoProfessor": d.conceitosDoProfessor,
                "conceitosDoAluno": d.conceitosDoAluno})),
            "naoCalculaveis": relatorio.naoCalculaveis.map(n => ({"nome": n.aluno.nome, "cpf": n.aluno.cpf,
                "motivo": n.motivo}))});
})

// Stubs das funcionalidades de turma e de conceitos do professor, de outros membros
// da equipe: permitem montar a situação de uma turma para os testes de aceitação.
app.put('/turma/:nome', function (req: express.Request, res: express.Response) {
  var nova: Turma = new Turma(req.params.nome, req.body.metas);
  nova.definirLimiarDeDiscrepancia(req.body.limiar);
  turmas.adicionar(new TurmaMatriculada(nova));
  res.send({"success": "A turma foi cadastrada com sucesso"});
})

app.post('/turma/:nome/aluno', function (req: express.Request, res: express.Response) {
  var matriculada: TurmaMatriculada = turmas.turmaDe(req.params.nome);
  if (!matriculada) return turmaNaoEncontrada(res, req.params.nome);
  matriculada.matricular(req.body.nome, req.body.cpf);
  res.send({"success": "O aluno foi matriculado com sucesso"});
})

app.put('/turma/:nome/professor/:cpf', function (req: express.Request, res: express.Response) {
  var matriculada: TurmaMatriculada = turmas.turmaDe(req.params.nome);
  if (!matriculada) return turmaNaoEncontrada(res, req.params.nome);
  responder(res, matriculada.getConceitosDoProfessor().registrarConceito(req.params.cpf, req.body.meta, req.body.conceito));
})

app.put('/turma/:nome/autoavaliacao/:cpf', function (req: express.Request, res: express.Response) {
  var matriculada: TurmaMatriculada = turmas.turmaDe(req.params.nome);
  if (!matriculada) return turmaNaoEncontrada(res, req.params.nome);
  responder(res, matriculada.getAutoavaliacoes().registrarConceito(req.params.cpf, req.body.meta, req.body.conceito));
})

function turmaNaoEncontrada(res: express.Response, nome: string): void {
  res.status(404).send({"failure": 'A turma "' + nome + '" não foi encontrada'});
}

// Traduz um Resultado do domínio para a resposta HTTP, em um único lugar, para
// que cada rota não repita essa decisão.
function responder(res: express.Response, resultado: Resultado): void {
  if (resultado.sucedeu()) {
    res.send({"success": "A auto-avaliação foi atualizada com sucesso"});
  } else {
    res.status(400).send({"failure": resultado.getErro()});
  }
}

var server = app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

function closeServer(): void {
   server.close();
}

export { app, server, closeServer }
