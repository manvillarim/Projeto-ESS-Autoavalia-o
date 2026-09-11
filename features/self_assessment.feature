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

  Scenario: submission with missing required goals
    Given the student "Ian Monteiro" has not assigned concepts to all goals
    When I submit the self-assessment for student "Ian Monteiro"
    Then the system displays an error message "All goals must be evaluated"
    Then I am prompted to complete all pending assessments
    
  Scenario: invalid concept assignment
    Given I am at the "Self-assessment" page
    When I assign an invalid concept "XYZ" to a goal
    Then the system prevents the assignment and shows "Invalid concept"  
    
  Scenario: experimental self-assessment goal filtering
    Given I am on the self-assessment tab
    When I filter goals by "Pending"
    Then I should only see goals without an assigned concept


  Scenario: view previous self-assessment history
    Given I have submitted a self-assessment in a previous session
    When I access the "Assessment History" tab
    Then I should see my past submitted concepts listed by date

    
  Scenario: teacher updates student concept
    Given I am logged in as a teacher
    When I change the concept of student "Ian Monteiro" to "MANA"
    Then the system updates the concept successfully