Feature: Self-assessment status

  As a professor responsible for a class
  I want to see which students have already completed their self-assessment and which have not
  So that I can follow up with the students who still need to submit it before the deadline

  Background:
    Given the accepted concepts are "MANA", "MPA" and "MA"
    And the status of a student is "Completed" when the student assigned a concept to every goal of the class
    And the status of a student is "In progress" when the student assigned a concept to some, but not all, goals of the class
    And the status of a student is "Pending" when the student assigned no concept to the goals of the class
    And a student is missing when the status is not "Completed"

  Scenario: see the self-assessment status of every student of the class
    Given I am on the self-assessment status page of the class "Turma A"
    And "Turma A" has only the goals "Specify requirements with quality" and "Write quality tests"
    And "Turma A" has only the students "Ana", "Bruno" and "Carla"
    And "Ana" assigned "MA, MPA" to herself
    And "Bruno" assigned no concept to himself
    And "Carla" assigned "MA" only to the goal "Write quality tests"
    When I open the self-assessment status page of "Turma A"
    Then I see "Ana" with the status "Completed"
    And I see "Bruno" with the status "Pending"
    And I see "Carla" with the status "In progress"
    And I see the count "1" of students who completed the self-assessment
    And I see the count "2" of missing students
    And I see the percentage "33%" of students who completed the self-assessment

  Scenario: every student of the class completed the self-assessment
    Given I am on the self-assessment status page of the class "Turma B"
    And "Turma B" has only the goals "Specify requirements with quality" and "Write quality tests"
    And every student of "Turma B" assigned a concept to all the goals of the class
    When I open the self-assessment status page of "Turma B"
    Then I see the count "0" of missing students
    And I see the percentage "100%" of students who completed the self-assessment
    And I see a message stating that every student completed the self-assessment

  Scenario: a class without students
    Given I am on the self-assessment status page of the class "Turma C"
    And "Turma C" has no students
    When I open the self-assessment status page of "Turma C"
    Then I see a message stating that "Turma C" has no students
    And I see the list of students empty

  Scenario: fail to open the self-assessment status of a class that does not exist
    Given the class "Turma Z" does not exist
    When I try to open the self-assessment status page of the class "Turma Z"
    Then I see an error message stating that the class was not found

  Scenario: the status changes to completed when the student assesses the last goal
    Given I am on the self-assessment status page of the class "Turma D"
    And "Turma D" has only the goals "Specify requirements with quality" and "Write quality tests"
    And "Diego" assigned "MPA" only to the goal "Specify requirements with quality"
    And I see "Diego" with the status "In progress"
    When "Diego" assigns "MA" to the goal "Write quality tests"
    And I reload the self-assessment status page of "Turma D"
    Then I see "Diego" with the status "Completed"
    And "Diego" is not counted in the number of missing students

  Scenario: the status changes back when the student removes a concept
    Given I am on the self-assessment status page of the class "Turma E"
    And "Turma E" has only the goals "Specify requirements with quality" and "Write quality tests"
    And "Elisa" assigned "MA, MA" to herself
    And I see "Elisa" with the status "Completed"
    When "Elisa" removes the concept of the goal "Write quality tests"
    And I reload the self-assessment status page of "Turma E"
    Then I see "Elisa" with the status "In progress"
    And "Elisa" is counted in the number of missing students

  Scenario: show only the missing students
    Given I am on the self-assessment status page of the class "Turma F"
    And "Turma F" has the following students:
      | student | status      |
      | Fábio   | Completed   |
      | Gabriel | Pending     |
      | Helena  | In progress |
    When I select the filter "Only missing students"
    Then I see only the students "Gabriel" and "Helena"
    And I do not see "Fábio" in the list of students

  Scenario: sort the students by status
    Given I am on the self-assessment status page of the class "Turma G"
    And "Turma G" has the following students:
      | student | status      |
      | Igor    | Completed   |
      | Júlia   | In progress |
      | Lucas   | Pending     |
    When I sort the list of students by status
    Then I see the students in the order "Lucas", "Júlia", "Igor"

  Scenario: the status is kept after the self-assessment is closed
    Given I am on the self-assessment status page of the class "Turma H"
    And "Turma H" has only the goals "Specify requirements with quality" and "Write quality tests"
    And "Marina" assigned "MPA" only to the goal "Specify requirements with quality"
    And the self-assessment of "Turma H" is closed
    When I open the self-assessment status page of "Turma H"
    Then I see "Marina" with the status "In progress"
    And I see a message stating that the self-assessment of "Turma H" is closed