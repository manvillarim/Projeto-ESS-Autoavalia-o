import request = require("request-promise");
import { closeServer } from '../ta-server';

var base_url = "http://localhost:3000/";

describe("O servidor", () => {
  var server:any;

  beforeAll(() => {server = require('../ta-server')});

  afterAll(() => {server.closeServer()});

  it("inicialmente retorna uma lista de alunos vazia", () => {
    return request.get(base_url + "alunos").then(body => expect(body).toBe("[]")).catch(e => expect(e).toEqual(null));
  })

  it("só cadastra alunos", () => {
    var options:any = {method: 'POST', uri: (base_url + "aluno"), body:{name: "Mari", cpf: "962"}, json: true};
    return request(options).then(body =>
         expect(body).toEqual({failure: "O aluno não pode ser cadastrado"})
    ).catch(e =>
         expect(e).toEqual(null)
    )
  });


  it("registra e remove o conceito de uma meta da auto-avaliação", () => {
    var meta = "Write quality tests";
    return request.put(base_url + "autoavaliacao/683", {"json":{"meta": meta, "conceito": "MPA"}}).then(body => {
        expect(body).toEqual({success: "A auto-avaliação foi atualizada com sucesso"});
        return request.get(base_url + "autoavaliacao/683", {"json": true}).then(body => {
            expect(body.conceitos[meta]).toBe("MPA");
            return request.delete(base_url + "autoavaliacao/683/" + encodeURIComponent(meta), {"json": true}).then(body => {
                expect(body).toEqual({success: "A auto-avaliação foi atualizada com sucesso"});
                return request.get(base_url + "autoavaliacao/683", {"json": true}).then(body =>
                    expect(body.conceitos[meta]).toBe(null)
                );
            });
        });
    });
  })

  it("não registra conceito inválido na auto-avaliação", () => {
    var options:any = {method: 'PUT', uri: (base_url + "autoavaliacao/683"),
                       body:{meta: "Write quality tests", conceito: "XYZ"}, json: true};
    return request(options).then(body =>
        fail("o servidor deveria ter recusado o conceito XYZ, mas respondeu " + JSON.stringify(body))
    ).catch(e => {
        expect(e.statusCode).toBe(400);
        expect(e.error.failure).toContain("XYZ");
    })
  })

  it("não cadastra alunos com CPF duplicado", () => {
    return request.post(base_url + "aluno", {"json":{"nome": "Mari", "cpf" : "965", "email":""}}).then(body => {
         expect(body).toEqual({success: "O aluno foi cadastrado com sucesso"});
         return request.post(base_url + "aluno", {"json":{"nome": "Pedro", "cpf" : "965", "email":""}}).then(body => {
             expect(body).toEqual({failure: "O aluno não pode ser cadastrado"});
             return request.get(base_url + "alunos").then(body => {
                 expect(body).toContain('{"nome":"Mari","cpf":"965","email":"","metas":{}}');
                 expect(body).not.toContain('{"nome":"Pedro","cpf":"965","email":"","metas":{}}');
             });
         });
     });
  })

  it("lista os alunos discrepantes de uma turma", () => {
    var metas = ["Specify requirements with quality", "Write quality tests"];
    var turma = base_url + "turma/" + encodeURIComponent("Turma HTTP");
    var conceitos = (rota: string, cpf: string, valores: string[]) =>
        request.put(turma + rota + cpf, {"json": {"meta": metas[0], "conceito": valores[0]}}).then(() =>
        request.put(turma + rota + cpf, {"json": {"meta": metas[1], "conceito": valores[1]}}));
    return request.put(turma, {"json": {"metas": metas, "limiar": 1}})
        .then(() => request.post(turma + "/aluno", {"json": {"nome": "Carlos", "cpf": "10"}}))
        .then(() => conceitos("/professor/", "10", ["MANA", "MANA"]))
        .then(() => conceitos("/autoavaliacao/", "10", ["MA", "MA"]))
        .then(() => request.get(turma + "/discrepancias", {"json": true}))
        .then(body => {
            expect(body.quantidadeDeDiscrepantes).toBe(1);
            expect(body.percentualDeDiscrepantes).toBe(100);
            expect(body.discrepantes[0].nome).toBe("Carlos");
            expect(body.discrepantes[0].discrepancia).toBe(4);
        });
  })

  it("informa que a turma não foi encontrada ao consultar as discrepâncias de uma turma inexistente", () => {
    return request.get(base_url + "turma/" + encodeURIComponent("Turma Z") + "/discrepancias", {"json": true}).then(body =>
        fail("o servidor deveria ter recusado a turma inexistente, mas respondeu " + JSON.stringify(body))
    ).catch(e => {
        expect(e.statusCode).toBe(404);
        expect(e.error.failure).toBe('A turma "Turma Z" não foi encontrada');
    })
  })

  it("ordena os alunos discrepantes por discrepância decrescente quando solicitado", () => {
    var metas = ["Specify requirements with quality", "Write quality tests"];
    var turma = base_url + "turma/" + encodeURIComponent("Turma Ordenada");
    var conceito = (rota: string, cpf: string, valor: string) =>
        request.put(turma + rota + cpf, {"json": {"meta": metas[0], "conceito": valor}});
    return request.put(turma, {"json": {"metas": [metas[0]], "limiar": 0}})
        .then(() => request.post(turma + "/aluno", {"json": {"nome": "Rafael", "cpf": "20"}}))
        .then(() => request.post(turma + "/aluno", {"json": {"nome": "Carlos", "cpf": "21"}}))
        .then(() => conceito("/professor/", "20", "MPA")).then(() => conceito("/autoavaliacao/", "20", "MA"))
        .then(() => conceito("/professor/", "21", "MANA")).then(() => conceito("/autoavaliacao/", "21", "MA"))
        .then(() => request.get(turma + "/discrepancias?ordem=discrepancia-decrescente", {"json": true}))
        .then(body => expect(body.discrepantes.map((d: any) => d.nome)).toEqual(["Carlos", "Rafael"]));
  })

})
