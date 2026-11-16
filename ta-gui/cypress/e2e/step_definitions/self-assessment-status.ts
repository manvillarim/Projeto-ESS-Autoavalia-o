import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Chave usada pela aplicação para cada meta, a partir do nome que aparece na tela.
const GOAL_KEYS: { [goal: string]: string } = {
  "Requisitos": "requisitos",
  "Gerência de Configuração": "gerDeConfiguracao",
  "Gerência de Projetos": "gerDeProjetos",
  "Testes": "testes",
};

// Endereço do servidor (ta-server), usado para preparar os dados de cada cenário.
const serverUrl = (): string => "http://localhost:3000";

// Alunos criados no cenário atual, indexados pelo nome usado no Gherkin.
let students: { [name: string]: any } = {};

const createStudent = (name: string, index: number) => {
  const student = {
    nome: name,
    cpf: `000.000.000-0${index}`,
    email: `aluno${index}@cin.ufpe.br`,
    github: `aluno${index}`,
    metas: {} as { [key: string]: string },
  };
  students[name] = student;
  cy.request("POST", `${serverUrl()}/aluno`, student).its("body").should("have.property", "success");
};

const saveConcepts = (name: string, concepts: { [key: string]: string }) => {
  const student = students[name];
  student.metas = { ...student.metas, ...concepts };
  cy.request("PUT", `${serverUrl()}/aluno`, student).its("body").should("have.property", "success");
};

const rowOf = (name: string) =>
  cy.contains("[data-cy=student-name]", new RegExp(`^\\s*${name}\\s*$`)).parent();

// Cada cenário começa com a turma vazia, para não depender da ordem de execução.
Before(() => {
  students = {};
  cy.request(`${serverUrl()}/alunos`).then(response => {
    const registered = typeof response.body === "string" ? JSON.parse(response.body) : response.body;
    registered.forEach((s: any) => cy.request("DELETE", `${serverUrl()}/aluno/${s.cpf}`));
  });
});

// ---------- Given ----------

Given("the class has only the goals {string}, {string}, {string} and {string}",
  (g1: string, g2: string, g3: string, g4: string) => {
    cy.visit("/metas");
    [g1, g2, g3, g4].forEach(goal => cy.contains("th", goal).should("be.visible"));
  });

Given("the class has only the students {string} and {string}", (s1: string, s2: string) => {
  [s1, s2].forEach((name, i) => createStudent(name, i + 1));
});

Given("the class has only the students {string}, {string} and {string}", (s1: string, s2: string, s3: string) => {
  [s1, s2, s3].forEach((name, i) => createStudent(name, i + 1));
});

Given("the class has no students", () => {
  cy.request(`${serverUrl()}/alunos`).its("body").should("satisfy",
    (body: any) => (typeof body === "string" ? JSON.parse(body) : body).length === 0);
});

Given("{string} assigned {string} to all the goals", (name: string, concept: string) => {
  const concepts: { [key: string]: string } = {};
  Object.values(GOAL_KEYS).forEach(key => (concepts[key] = concept));
  saveConcepts(name, concepts);
});

Given("{string} assigned {string} to all the goals except {string}", (name: string, concept: string, except: string) => {
  const concepts: { [key: string]: string } = {};
  Object.entries(GOAL_KEYS).filter(([goal]) => goal !== except).forEach(([, key]) => (concepts[key] = concept));
  saveConcepts(name, concepts);
});

Given("{string} assigned {string} only to the goal {string}", (name: string, concept: string, goal: string) => {
  saveConcepts(name, { [GOAL_KEYS[goal]]: concept });
});

Given("{string} assigned no concept to himself/herself", (name: string) => {
  expect(students[name].metas).to.deep.equal({});
});

Given("I am on the self-assessment status page", () => {
  cy.visit("/status");
  cy.get("[data-cy=status-page]").should("be.visible");
});

Given("I see {string} with the status {string} on the self-assessment status page", (name: string, status: string) => {
  cy.visit("/status");
  rowOf(name).find("[data-cy=student-status]").should("have.text", status);
});

// ---------- When ----------

When("I open the self-assessment status page", () => {
  cy.visit("/status");
  cy.get("[data-cy=status-page]").should("be.visible");
});

When("I select the filter {string}", (filter: string) => {
  expect(filter).to.equal("Only missing students");
  cy.get("[data-cy=only-missing-filter]").check();
});

When("I sort the list of students by status", () => {
  cy.get("[data-cy=sort-by-status]").click();
});

When("I register the concept {string} to the goal {string} of {string} on the goals page",
  (concept: string, goal: string, name: string) => {
    cy.intercept("PUT", "**/aluno").as("updateStudent");
    cy.visit("/metas");
    cy.get(`[data-cy="goals-row-${students[name].cpf}"] [data-cy=goal-${GOAL_KEYS[goal]}]`)
      .clear()
      .type(concept)
      .blur();
    cy.wait("@updateStudent").its("response.body").should("have.property", "success");
  });

// ---------- Then ----------

Then("I see {string} with the status {string}", (name: string, status: string) => {
  rowOf(name).find("[data-cy=student-status]").should("have.text", status);
});

Then("I see the count {string} of students who completed the self-assessment", (count: string) => {
  cy.get("[data-cy=completed-count]").should("have.text", count);
});

Then("I see the count {string} of missing students", (count: string) => {
  cy.get("[data-cy=missing-count]").should("have.text", count);
});

Then("I see the percentage {string} of students who completed the self-assessment", (percentage: string) => {
  cy.get("[data-cy=completed-percentage]").should("have.text", percentage);
});

Then("I see a message stating that every student completed the self-assessment", () => {
  cy.get("[data-cy=all-completed-message]").should("be.visible");
});

Then("I see a message stating that the class has no students", () => {
  cy.get("[data-cy=no-students-message]").should("be.visible");
});

Then("I see the list of students empty", () => {
  cy.get("[data-cy=student-row]").should("not.exist");
});

Then("I see only the students {string} and {string}", (s1: string, s2: string) => {
  cy.get("[data-cy=student-name]").should("have.length", 2);
  [s1, s2].forEach(name => rowOf(name).should("be.visible"));
});

Then("I do not see {string} in the list of students", (name: string) => {
  cy.contains("[data-cy=student-name]", name).should("not.exist");
});

Then("I see the students in the order {string}, {string}, {string}", (s1: string, s2: string, s3: string) => {
  cy.get("[data-cy=student-name]").then($names => {
    expect([...$names].map(n => n.textContent!.trim())).to.deep.equal([s1, s2, s3]);
  });
});
