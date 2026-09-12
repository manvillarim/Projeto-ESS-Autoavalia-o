Feature: Autoavaliação do aluno
  Como aluno da disciplina
  Eu quero realizar minha autoavaliação
  Para acompanhar meu desempenho no curso

Scenario: Submissao de autoavaliacao com sucesso
    Given que o aluno esta autenticado no sistema
    When ele preenche o formulario de autoavaliacao
    Then o sistema registra o envio com sucesso.

Scenario: Submissao sem preenchimento dos campos obrigatorios
    Given que o aluno esta autenticado no sistema
    When ele tenta submeter a autoavaliacao com campos em branco
    Then o sistema exibe uma mensagem de erro alertando os campos pendentes

Scenario: Submissao de autoavaliacao fora do prazo
    Given que o aluno esta autenticado no sistema
    When ele tenta enviar a autoavaliacao apos a data limite
    Then o sistema impede o envio informando prazo expirado
    Then o sistema sugere contato com a coordenacao

Scenario: Submissao de autoavaliacao com anexo comprobatório
    Given que o aluno esta autenticado no sistema
    When ele anexa o comprovante de atividades
    Then o sistema valida o arquivo anexado

Scenario: Visualizacao de historico de autoavaliacoes anteriores
    Given que o aluno esta autenticado no sistema
    When ele acessa a aba de historico
    Then o sistema lista todas as autoavaliacoes passadas

Scenario: Visualizacao de historico de autoavaliacoes anteriores
    Given que o aluno esta autenticado no sistema
    When ele acessa a aba de historico
    Then o sistema lista todas as autoavaliacoes passadas com notas e feedbacks detalhados

Scenario: Rebase teste A
    Given que o aluno esta autenticado
    Then o sistema executa teste A

Scenario: Rebase teste B
    Given que o aluno esta autenticado
    Then o sistema executa teste B

Scenario: Exportacao de relatorio de autoavaliacao
    Given que o aluno esta autenticado no sistema
    When ele solicita a exportacao do relatorio
    Then o sistema gera o arquivo em formato PDF