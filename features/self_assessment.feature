Feature: Self-assessment

  As a student
  I want to assign a concept (MA, MPA or MANA) that I believe I deserve for each learning goal, seeing the professor's concept for the same goals on the same page
  So that I can register my own perception of my performance

  Scenario: successful self-assessment
    Given I am at the "Self-assessment" page
    When I assign the concept "MPA" to the goal "Entender conceitos de requisitos"
    And I submit the self-assessment
    Then I see a confirmation message

  Scenario: successful self-assessment submission
    Given the student "Ian Monteiro" has no self-assessment concept stored
    When I submit the self-assessment "MPA" for the student "Ian Monteiro"
    Then the system stores the concept "MPA" for the student "Ian Monteiro"

  Scenario: submission with missing required goals
    Given the student "Ian Monteiro" has not assigned concepts to all goals
    When I submit the self-assessment for the student "Ian Monteiro"
    Then the system displays the error message "All goals must be evaluated"
    And I am prompted to complete all pending assessments

  Scenario: invalid concept assignment
    Given I am at the "Self-assessment" page
    When I assign the invalid concept "XYZ" to a goal
    Then the system prevents the assignment and shows "Invalid concept"

  Scenario: experimental self-assessment goal filtering
    Given I am on the self-assessment tab
    When I filter the goals by "Pending"
    Then I see only the goals without an assigned concept

  Scenario: view previous self-assessment history
    Given I have submitted a self-assessment in a previous session
    When I access the "Assessment History" tab
    Then I see my past submitted concepts listed by date

  Scenario: teacher updates the concept of a student after review
    Given I am logged in as a teacher
    When I change the concept of the student "Ian Monteiro" to "MANA"
    And I add the feedback note "Revisão efetuada com sucesso"
    Then the system updates the concept and logs the note successfully
