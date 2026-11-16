Feature: Self-assessment status

  As a professor responsible for a class
  I want to see which students have already completed their self-assessment and which have not
  So that I can follow up with the students who still need to submit it before the deadline

  Background:
    Given the class has only the goals "Requisitos", "Gerência de Configuração", "Gerência de Projetos" and "Testes"

  Scenario: see the self-assessment status of every student of the class
    Given the class has only the students "Ana", "Bruno" and "Carla"
    And "Ana" assigned "MA" to all the goals
    And "Bruno" assigned no concept to himself
    And "Carla" assigned "MPA" only to the goal "Testes"
    When I open the self-assessment status page
    Then I see "Ana" with the status "Completed"
    And I see "Bruno" with the status "Pending"
    And I see "Carla" with the status "In progress"
    And I see the count "1" of students who completed the self-assessment
    And I see the count "2" of missing students
    And I see the percentage "33%" of students who completed the self-assessment

  Scenario: every student of the class completed the self-assessment
    Given the class has only the students "Ana" and "Bruno"
    And "Ana" assigned "MA" to all the goals
    And "Bruno" assigned "MPA" to all the goals
    When I open the self-assessment status page
    Then I see the count "0" of missing students
    And I see the percentage "100%" of students who completed the self-assessment
    And I see a message stating that every student completed the self-assessment

  Scenario: a class without students
    Given the class has no students
    When I open the self-assessment status page
    Then I see a message stating that the class has no students
    And I see the list of students empty

  Scenario: show only the missing students
    Given the class has only the students "Fábio", "Gabriel" and "Helena"
    And "Fábio" assigned "MA" to all the goals
    And "Gabriel" assigned no concept to himself
    And "Helena" assigned "MPA" only to the goal "Requisitos"
    And I am on the self-assessment status page
    When I select the filter "Only missing students"
    Then I see only the students "Gabriel" and "Helena"
    And I do not see "Fábio" in the list of students

  Scenario: sort the students by status
    Given the class has only the students "Igor", "Júlia" and "Lucas"
    And "Igor" assigned "MA" to all the goals
    And "Júlia" assigned "MANA" only to the goal "Testes"
    And "Lucas" assigned no concept to himself
    And I am on the self-assessment status page
    When I sort the list of students by status
    Then I see the students in the order "Lucas", "Júlia", "Igor"
