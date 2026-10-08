# teachingassistant
projeto exemplo da disciplina de ESS da graduação em Ciência da Computação do CIn-UFPE

## Discrepância entre os conceitos do aluno e do professor

A página "Discrepâncias" lista os alunos de uma turma cuja auto-avaliação difere do conceito do professor.
A divergência de uma meta é o número de níveis entre os conceitos (MANA < MPA < MA), a discrepância do aluno
é a soma das divergências de todas as metas, e o aluno é discrepante quando a discrepância é maior que o limiar da turma.

Rotas do servidor (`/turma/:nome/...`): `discrepancias` (aceita `?ordem=discrepancia-decrescente`),
`discrepancias/csv`, `discrepancias/distribuicao`, `limiar`, `notificacoes`, `notificacoes/assinatura` e `recalculo`.
As rotas que cadastram turma, alunos e conceitos do professor são stubs usados pelos testes de aceitação.
