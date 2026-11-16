Feature: Self-assessment status integrated with the goals page

  As a professor responsible for a class
  I want the self-assessment status to reflect the concepts registered on the goals page
  So that the status page is always consistent with what the students assessed

  Background:
    Given the class has only the goals "Requisitos", "Gerência de Configuração", "Gerência de Projetos" and "Testes"

  Scenario: the status changes to completed when the student assesses the last goal
    Given the class has only the students "Diego" and "Elisa"
    And "Diego" assigned "MPA" to all the goals except "Testes"
    And "Elisa" assigned no concept to herself
    And I see "Diego" with the status "In progress" on the self-assessment status page
    When I register the concept "MA" to the goal "Testes" of "Diego" on the goals page
    And I open the self-assessment status page
    Then I see "Diego" with the status "Completed"
    And I see the count "1" of students who completed the self-assessment
    And I see the count "1" of missing students
