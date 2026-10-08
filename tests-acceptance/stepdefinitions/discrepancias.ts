import { defineSupportCode } from 'cucumber';
import { browser, $, element, ElementArrayFinder, by } from 'protractor';
import http = require('http');
let chai = require('chai').use(require('chai-as-promised'));
let expect = chai.expect;

let servidor = { host: 'localhost', port: 3000 };

// Envia uma requisição JSON ao servidor; é o driver que monta a situação de uma
// turma, já que o cadastro de turmas e de conceitos do professor é de outros membros.
let chamar = ((metodo: string, caminho: string, corpo?: any) => new Promise<any>((resolve, reject) => {
    let dados = corpo === undefined ? '' : JSON.stringify(corpo);
    let req = http.request({ host: servidor.host, port: servidor.port, method: metodo, path: caminho,
                             headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(dados) } },
                           res => {
        let texto = '';
        res.on('data', pedaco => texto += pedaco);
        res.on('end', () => resolve(texto ? JSON.parse(texto) : {}));
    });
    req.on('error', reject);
    req.write(dados);
    req.end();
}));

let caminhoDaTurma = ((turma: string) => '/turma/' + encodeURIComponent(turma));

// O que os cenários já disseram sobre cada turma, para recriá-la no servidor
// sempre que uma nova informação (metas ou limiar) chega.
class EstadoDaTurma {
    metas: string[] = [];
    limiar: number = 0;
    cpfs: { [nome: string]: string } = {};
}
let turmas: { [nome: string]: EstadoDaTurma } = {};
let nextCpf = 1000;
// Turma da página em que o cenário está; os passos de conceitos não repetem o nome da turma.
let ultimaTurma: string;

let estadoDe = ((turma: string) => turmas[turma] = turmas[turma] || new EstadoDaTurma());

let publicar = (async (turma: string) => {
    let estado = estadoDe(turma);
    await chamar('PUT', caminhoDaTurma(turma), { metas: estado.metas, limiar: estado.limiar });
});

// Matricula o aluno na turma, se ainda não estiver, e devolve o seu CPF.
let matricular = (async (turma: string, aluno: string) => {
    let estado = estadoDe(turma);
    if (!estado.cpfs[aluno]) {
        estado.cpfs[aluno] = String(nextCpf++);
        await chamar('POST', caminhoDaTurma(turma) + '/aluno', { nome: aluno, cpf: estado.cpfs[aluno] });
    }
    return estado.cpfs[aluno];
});

let atribuir = (async (quem: string, turma: string, aluno: string, conceitos: string) => {
    let cpf = await matricular(turma, aluno);
    let metas = estadoDe(turma).metas;
    let lista = conceitos.split(', ');
    for (let i = 0; i < metas.length; i++) {
        await chamar('PUT', caminhoDaTurma(turma) + '/' + quem + '/' + cpf, { meta: metas[i], conceito: lista[i] });
    }
});

let nomesEntreAspas = ((texto: string) => (texto.match(/"([^"]*)"/g) || []).map(n => n.replace(/"/g, '')));

let linhaDo = ((aluno: string) => element.all(by.name('discrepante'))
                                         .filter(e => e.element(by.name('nomediscrepante')).getText().then(t => t === aluno)));

defineSupportCode(function ({ Given, When, Then }) {
    Given(/^I am on the discrepancies page of the class "([^\"]*)"$/, async (turma: any) => {
        ultimaTurma = turma;
        await browser.get("http://localhost:4200/");
        await expect(browser.getTitle()).to.eventually.equal('TaGui');
        await $("a[name='discrepancias']").click();
    });

    Given(/^"([^\"]*)" has only the goals (.*)$/, async (turma: any, metas: any) => {
        estadoDe(turma).metas = nomesEntreAspas(metas);
        await publicar(turma);
    });

    Given(/^the discrepancy threshold of "([^\"]*)" is "(\d*)"$/, async (turma: any, limiar: any) => {
        estadoDe(turma).limiar = Number(limiar);
        await publicar(turma);
    });

    Given(/^"([^\"]*)" has only the students (.*)$/, async (turma: any, alunos: any) => {
        for (let aluno of nomesEntreAspas(alunos)) await matricular(turma, aluno);
    });

    Given(/^the professor assigned "([^\"]*)" to "([^\"]*)" and "([^\"]*)" assigned "([^\"]*)" to (?:himself|herself)$/,
          async (doProfessor: any, aluno: any, mesmoAluno: any, doAluno: any) => {
        let turma = ultimaTurma;
        await atribuir('professor', turma, aluno, doProfessor);
        await atribuir('autoavaliacao', turma, aluno, doAluno);
    });

    When(/^I open the discrepancies page of "([^\"]*)"$/, async (turma: any) => {
        await $("input[name='turmabox']").sendKeys(<string> turma);
        await $("button[name='abrirbtn']").click();
    });

    Then(/^I see "([^\"]*)" in the list of discrepant students with the discrepancy "(\d*)"$/, async (aluno: any, valor: any) => {
        let linhas = linhaDo(aluno);
        await expect(linhas.count()).to.eventually.equal(1);
        await expect(linhas.first().element(by.name('valordiscrepancia')).getText()).to.eventually.equal(valor);
    });

    Then(/^I do not see "([^\"]*)" in the list of discrepant students$/, async (aluno: any) => {
        await expect(linhaDo(aluno).count()).to.eventually.equal(0);
    });

    Then(/^I see the count "(\d*)" of discrepant students$/, async (quantidade: any) => {
        await expect($("span[name='quantidade']").getText()).to.eventually.equal(quantidade);
    });

    Then(/^I see the percentage "(\d*%)" of discrepant students in relation to the total number of students of the class$/,
         async (percentual: any) => {
        await expect($("span[name='percentual']").getText()).to.eventually.equal(percentual);
    });
});
