Feature: self-assessment
  As a student
  I want to assign a concept (MA, MPA or MANA) that I believe I deserve for each learning goal, seeing the professor's concept for the same goals on the same page
  So that I can register my own perception of my performance

  Scenario: successful self-assessment
    Given I am at the "Self-assessment" page
    When I assign concept "MPA" to goal "Entender conceitos de requisitos"
    And I submit the self-assessment
    Then I see a confirmation message

  Scenario: successful self-assessment submission
    Given the student "Ian Monteiro" has no self-assessment concept stored
    When I submit the self-assessment "MPA" for student "Ian Monteiro"
    Then the system stores concept "MPA" for student "Ian Monteiro"