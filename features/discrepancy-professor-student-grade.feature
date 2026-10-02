Feature: Discrepancy between student and professor grades

  As a professor responsible for a class
  I want to see the discrepancies between the self-assessment grades of my students and the grades I assigned
  So that I can quickly identify the students who assessed themselves very differently from my assessment

  Scenario: list the students whose discrepancy is above the defined threshold
    Given I am on the discrepancies page of the class "Turma A"
    And the discrepancy threshold of "Turma A" is "1.5"
    And "Turma A" has only the students "Carlos", "Beatriz" and "Rafael"
    And "Carlos" has the self-assessment grade "9.0" and the professor grade "5.0"
    And "Beatriz" has the self-assessment grade "8.0" and the professor grade "7.5"
    And "Rafael" has the self-assessment grade "6.0" and the professor grade "4.0"
    When I open the discrepancies page of "Turma A"
    Then I see only the students whose difference between the self-assessment grade and the professor grade is greater than "1.5"
    And I see the students "Carlos" and "Rafael" in the list of discrepant students
    And I do not see "Beatriz" in the list of discrepant students
    And I see the count "2" of discrepant students
    And I see the percentage "67%" of discrepant students in relation to the total number of students of the class

  Scenario: no discrepant student in the class
    Given I am on the discrepancies page of the class "Turma B"
    And the discrepancy threshold of "Turma B" is "2.0"
    And every student of "Turma B" has a difference between the self-assessment grade and the professor grade lower than or equal to "2.0"
    When I open the discrepancies page of "Turma B"
    Then I see the count "0" of discrepant students
    And I see the list of discrepant students empty

  Scenario: fail to open the discrepancies of a class that does not exist
    Given the class "Turma Z" does not exist
    When I try to open the discrepancies page of the class "Turma Z"
    Then I see an error message stating that the class was not found

  Scenario: fail to compute the discrepancy of a student without a professor grade
    Given I am on the discrepancies page of the class "Turma C"
    And the student "Maria" has a self-assessment grade registered but has no professor grade registered
    When I open the discrepancies page of "Turma C"
    Then I see a message stating that the discrepancy of the student "Maria" could not be computed
    And "Maria" is not counted in the number of discrepant students
    And I see a suggestion to register the pending grade of the student "Maria"

  Scenario: a difference exactly equal to the threshold is not a discrepancy
    Given I am on the discrepancies page of the class "Turma D"
    And the discrepancy threshold of "Turma D" is "2.0"
    And the student "João" has a difference between the self-assessment grade and the professor grade equal to "2.0"
    When I open the discrepancies page of "Turma D"
    Then I do not see "João" in the list of discrepant students

  Scenario: sort the discrepant students by decreasing difference of grade
    Given I am on the discrepancies page of the class "Turma E"
    And the discrepancy threshold of "Turma E" is "1.0"
    And "Turma E" has the following discrepant students:
      | student | difference of grade |
      | Carlos  | 4.0                 |
      | Beatriz | 3.5                 |
      | Rafael  | 1.5                 |
    When I sort the list of discrepant students by decreasing difference of grade
    Then I see the discrepant students in the order "Carlos", "Beatriz", "Rafael"

  Scenario: export the list of discrepant students to CSV
    Given I am on the discrepancies page of the class "Turma F"
    And "Turma F" has discrepant students
    When I click on "Export to CSV"
    Then I receive a CSV file containing the discrepant students and their differences of grade

  Scenario: see the distribution chart of the discrepancies of the class
    Given I am on the discrepancies page of the class "Turma G"
    And "Turma G" has students with different levels of discrepancy
    When I open the "Discrepancy distribution" tab
    Then I see a chart with the number of students grouped by range of difference of grade

  Scenario: be notified about new discrepant students after the grades are updated
    Given I am registered to receive notifications of the class "Turma H"
    And a new student of "Turma H" starts to have a difference of grade above the defined threshold
    When the system recomputes the discrepancies of the class
    Then I receive a notification informing the new discrepant student

  Scenario: change the discrepancy threshold of the class
    Given I am on the discrepancies page of the class "Turma I"
    And the discrepancy threshold of "Turma I" is "2.0"
    And the student "Pedro" has a difference between the self-assessment grade and the professor grade equal to "1.5"
    When I change the discrepancy threshold to "1.0"
    Then the list of discrepant students is recomputed using the new threshold of "1.0"
    And "Pedro" starts to appear in the list of discrepant students
