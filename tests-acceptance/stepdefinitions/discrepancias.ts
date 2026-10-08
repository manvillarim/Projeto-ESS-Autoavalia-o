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

// Baixa o arquivo de um endereço, o que o navegador faz ao seguir o link de exportação.
let baixar = ((url: string) => new Promise<any>((resolve, reject) => {
    http.get(url, res => {
        let texto = '';
        res.on('data', pedaco => texto += pedaco);
        res.on('end', () => resolve({ tipo: res.headers['content-type'], texto: texto }));
    }).on('error', reject);
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
// Distribuição que o cenário montou, como pares [discrepância, quantidade de alunos].
let distribuicaoEsperada: number[][];
// Arquivo recebido ao exportar, para os passos seguintes conferirem o conteúdo.
let arquivo: any;

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

const METAS_PADRAO = ["Specify requirements with quality", "Write quality tests"];

// Cenários que não descrevem as metas da turma usam as metas padrão.
let garantirMetas = (async (turma: string) => {
    let estado = estadoDe(turma);
    if (estado.metas.length === 0) {
        estado.metas = METAS_PADRAO.slice();
        await publicar(turma);
    }
});

let nomesEntreAspas = ((texto: string) => (texto.match(/"([^"]*)"/g) || []).map(n => n.replace(/"/g, '')));

let linhaDo = ((aluno: string) => element.all(by.name('discrepante'))
                                         .filter(e => e.element(by.name('nomediscrepante')).getText().then(t => t === aluno)));

let irParaDiscrepancias = (async () => {
    await browser.get("http://localhost:4200/");
    await expect(browser.getTitle()).to.eventually.equal('TaGui');
    await $("a[name='discrepancias']").click();
});

let abrirDiscrepancias = (async (turma: string) => {
    await $("input[name='turmabox']").sendKeys(turma);
    await $("button[name='abrirbtn']").click();
});

defineSupportCode(function ({ Given, When, Then }) {
    Given(/^I am on the discrepancies page of the class "([^\"]*)"$/, async (turma: any) => {
        ultimaTurma = turma;
        await irParaDiscrepancias();
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

    Given(/^every student of "([^\"]*)" has a discrepancy lower than or equal to "(\d*)"$/, async (turma: any, limite: any) => {
        let estado = estadoDe(turma);
        await garantirMetas(turma);
        // Um aluno sem divergência e outro com divergência exatamente igual ao limite.
        let restante = Number(limite);
        let doAluno = estado.metas.map(() => {
            let divergencia = Math.min(restante, 2);
            restante -= divergencia;
            return ["MA", "MPA", "MANA"][divergencia];
        });
        let doProfessor = estado.metas.map(() => "MA");
        await atribuir('professor', turma, "Student without divergence", doProfessor.join(', '));
        await atribuir('autoavaliacao', turma, "Student without divergence", doProfessor.join(', '));
        await atribuir('professor', turma, "Student at the limit", doProfessor.join(', '));
        await atribuir('autoavaliacao', turma, "Student at the limit", doAluno.join(', '));
    });

    Given(/^the class "([^\"]*)" does not exist$/, async (turma: any) => {
        // O servidor só conhece as turmas que os passos cadastram; basta não cadastrar esta.
        delete turmas[turma];
    });

    Given(/^the student "([^\"]*)" assigned concepts to all the goals of "([^\"]*)"$/, async (aluno: any, turma: any) => {
        await garantirMetas(turma);
        await atribuir('autoavaliacao', turma, aluno, estadoDe(turma).metas.map(() => "MA").join(', '));
    });

    Given(/^the professor did not assign concepts to "([^\"]*)"$/, async (aluno: any) => {
        await matricular(ultimaTurma, aluno);
    });

    Given(/^"([^\"]*)" has the following students:$/, async (turma: any, tabela: any) => {
        for (let linha of tabela.hashes()) {
            await atribuir('professor', turma, linha['student'], linha['professor concepts']);
            await atribuir('autoavaliacao', turma, linha['student'], linha['student concepts']);
        }
    });

    Given(/^"([^\"]*)" has discrepant students$/, async (turma: any) => {
        await garantirMetas(turma);
        estadoDe(turma).limiar = 1;
        await publicar(turma);
        let divergente = estadoDe(turma).metas.map(() => "MANA").join(', ');
        await atribuir('professor', turma, "Carlos", divergente);
        await atribuir('autoavaliacao', turma, "Carlos", estadoDe(turma).metas.map(() => "MA").join(', '));
    });

    Given(/^"([^\"]*)" has students with different levels of discrepancy$/, async (turma: any) => {
        await garantirMetas(turma);
        let metas = estadoDe(turma).metas;
        // O professor atribui MA em todas as metas; a divergência de cada aluno está só na primeira meta.
        let alunos: [string, string][] = [["Student zero", "MA"], ["Student one", "MPA"],
                                          ["Student another one", "MPA"], ["Student two", "MANA"]];
        let divergencia: { [conceito: string]: number } = { "MA": 0, "MPA": 1, "MANA": 2 };
        distribuicaoEsperada = [[0, 0], [1, 0], [2, 0]];
        for (let [aluno, conceito] of alunos) {
            await atribuir('professor', turma, aluno, metas.map(() => "MA").join(', '));
            await atribuir('autoavaliacao', turma, aluno, [conceito].concat(metas.slice(1).map(() => "MA")).join(', '));
            distribuicaoEsperada[divergencia[conceito]][1]++;
        }
    });

    Given(/^I am registered to receive notifications of the class "([^\"]*)"$/, async (turma: any) => {
        ultimaTurma = turma;
        await garantirMetas(turma);
        estadoDe(turma).limiar = 1;
        await publicar(turma);
        await chamar('PUT', caminhoDaTurma(turma) + '/notificacoes/assinatura');
    });

    Given(/^a new student of "([^\"]*)" starts to have a discrepancy above the defined threshold$/, async (turma: any) => {
        let metas = estadoDe(turma).metas;
        await atribuir('professor', turma, "New student", metas.map(() => "MANA").join(', '));
        await atribuir('autoavaliacao', turma, "New student", metas.map(() => "MA").join(', '));
    });

    When(/^I open the discrepancies page of "([^\"]*)"$/, abrirDiscrepancias);

    When(/^the system recomputes the discrepancies of the class$/, async () => {
        await chamar('POST', caminhoDaTurma(ultimaTurma) + '/recalculo');
    });

    When(/^I click on "Export to CSV"$/, async () => {
        arquivo = null;
        let link = $("a[name='exportarcsv']");
        let url = await link.getAttribute('href');
        await link.click();
        arquivo = await baixar(url);
    });

    When(/^I open the "Discrepancy distribution" tab$/, async () => {
        await $("button[name='abadistribuicao']").click();
    });

    When(/^I sort the list of discrepant students by decreasing discrepancy$/, async () => {
        await $("button[name='ordenarbtn']").click();
    });

    When(/^I try to open the discrepancies page of the class "([^\"]*)"$/, abrirDiscrepancias);

    Then(/^I see "([^\"]*)" in the list of discrepant students with the discrepancy "(\d*)"$/, async (aluno: any, valor: any) => {
        let linhas = linhaDo(aluno);
        await expect(linhas.count()).to.eventually.equal(1);
        await expect(linhas.first().element(by.name('valordiscrepancia')).getText()).to.eventually.equal(valor);
    });

    Then(/^I see a message stating that the discrepancy of the student "([^\"]*)" could not be computed$/, async (aluno: any) => {
        let mensagem = element(by.name('naocalculavel'));
        await expect(mensagem.getText()).to.eventually.contain('Não foi possível calcular a discrepância de ' + aluno);
    });

    Then(/^"([^\"]*)" is not counted in the number of discrepant students$/, async (aluno: any) => {
        await expect(linhaDo(aluno).count()).to.eventually.equal(0);
        let listados = await element.all(by.name('discrepante')).count();
        await expect($("span[name='quantidade']").getText()).to.eventually.equal(String(listados));
    });

    Then(/^I see a suggestion to assign the pending concepts of the student "([^\"]*)"$/, async (aluno: any) => {
        await expect(element(by.name('sugestao')).getText()).to.eventually.contain('Atribua os conceitos pendentes de ' + aluno);
    });

    Then(/^I see the discrepant students in the order (.*)$/, async (ordem: any) => {
        let nomes = element.all(by.name('nomediscrepante')).map(e => e.getText());
        await expect(nomes).to.eventually.deep.equal(nomesEntreAspas(ordem));
    });

    Then(/^I receive a CSV file containing the discrepant students, the concepts of each goal and their discrepancies$/, async () => {
        expect(arquivo.tipo).to.contain('text/csv');
        let linhas: string[] = arquivo.texto.split('\r\n');
        expect(linhas[0]).to.contain('Student').and.to.contain('Discrepancy');
        expect(linhas[0]).to.contain('Professor: ' + estadoDe(ultimaTurma).metas[0]);
        expect(linhas[1]).to.match(/^Carlos,\d+,MANA,MA(,MANA,MA)*,\d+$/);
    });

    Then(/^I see a chart with the number of students grouped by discrepancy$/, async () => {
        let barras = element.all(by.name('barra'));
        let rotulos = barras.map(b => b.element(by.name('rotulobarra')).getText());
        let quantidades = barras.map(b => b.element(by.name('quantidadebarra')).getText());
        await expect(rotulos).to.eventually.deep.equal(distribuicaoEsperada.map(f => String(f[0])));
        await expect(quantidades).to.eventually.deep.equal(distribuicaoEsperada.map(f => String(f[1])));
    });

    Then(/^I receive a notification informing the new discrepant student$/, async () => {
        await irParaDiscrepancias();
        await abrirDiscrepancias(ultimaTurma);
        await expect(element(by.name('notificacao')).getText()).to.eventually.contain('New student');
    });

    Then(/^I see an error message stating that the class was not found$/, async () => {
        await expect($("p[name='erro']").getText()).to.eventually.contain('não foi encontrada');
    });

    Then(/^I see the list of discrepant students empty$/, async () => {
        await expect(element.all(by.name('discrepante')).count()).to.eventually.equal(0);
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
