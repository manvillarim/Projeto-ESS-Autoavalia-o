Feature: Student self-assessment request

  As a professor responsible for a class
  I want to request self-assessment only from students who have not yet submitted it
  So that I can charge pending students without resending the request to those who already responded

  Scenario: request self-assessment only from pending students
    Given I am logged in as the professor "Paulo Borba", responsible for the class "ESS 2025.1"
    And "ESS 2025.1" has only the students "Bruno Tavares", "Ana Ribeiro" and "Diego Alves"
    And "Bruno Tavares" has the self-assessment "MA, MPA, MANA" registered in "ESS 2025.1"
    And "Ana Ribeiro" and "Diego Alves" do not have a self-assessment registered in "ESS 2025.1"
    And no student in "ESS 2025.1" has received a self-assessment request today
    And I am on the "Self-assessment status" page of "ESS 2025.1"
    When I request self-assessment from the pending students of "ESS 2025.1"
    Then I remain on the "Self-assessment status" page of "ESS 2025.1"
    And I see a confirmation message that the request was sent to "2" students
    And I see "Ana Ribeiro" with a self-assessment request sent today
    And I see "Diego Alves" with a self-assessment request sent today
    And I do not see "Bruno Tavares" with a self-assessment request sent today
    And I see "Bruno Tavares" in the list of students with self-assessment sent
    And I see the count "1" of students with self-assessment sent


    Scenario: query students with discrepant self-assessment (after feedback)
    Given the system has the class "ESS 2025.1" with only the goals "Understand requirements concepts", "Specify requirements with quality", "Understand configuration management concepts" and "Write quality tests"
    And the system has only the students "Bruno Tavares", "Carla Nunes", "Ana Ribeiro" and "Diego Alves" enrolled in "ESS 2025.1"
    And the system has the concepts "MPA, MPA, MANA, MPA" assigned by the professor to "Bruno Tavares" in "ESS 2025.1" and the self-assessment "MA, MA, MANA, MPA" of "Bruno Tavares" in "ESS 2025.1"
    And the system has the concepts "MA, MA, MPA, MA" assigned by the professor to "Carla Nunes" in "ESS 2025.1" and the self-assessment "MPA, MPA, MANA, MPA" of "Carla Nunes" in "ESS 2025.1"
    And the system has the concepts "MA, MPA, MA, MPA" assigned by the professor to "Ana Ribeiro" in "ESS 2025.1" and the self-assessment "MA, MPA, MA, MPA" of "Ana Ribeiro" in "ESS 2025.1"
    And the system has the concepts "MPA, MPA, MPA, MPA" assigned by the professor to "Diego Alves" in "ESS 2025.1"
    And the system does not have a self-assessment of "Diego Alves" in "ESS 2025.1"
    When I request the system for the students with discrepant self-assessment in "ESS 2025.1"
    Then the system returns the count "1" of students with discrepant self-assessment
    And the system returns the percentage "33%" of students with discrepant self-assessment
    And the system returns the list of students with discrepant self-assessment containing only "Bruno Tavares"
    And the system has the self-assessment "MA, MA, MANA, MPA" of "Bruno Tavares" in "ESS 2025.1"
    And the system has the self-assessment "MPA, MPA, MANA, MPA" of "Carla Nunes" in "ESS 2025.1"
    And the system has the self-assessment "MA, MPA, MA, MPA" of "Ana Ribeiro" in "ESS 2025.1"
    And the system does not have a self-assessment of "Diego Alves" in "ESS 2025.1"

    Scenario: fail to request self-assessment when there are no pending students
    Given I am logged in as the professor "Paulo Borba", responsible for the class "ESS 2025.1"
    And "ESS 2025.1" has only the students "Bruno Tavares", "Ana Ribeiro" and "Diego Alves"
    And all students in "ESS 2025.1" have a self-assessment registered
    And I am on the "Self-assessment status" page of "ESS 2025.1"
    When I request self-assessment from the pending students of "ESS 2025.1"
    Then I remain on the "Self-assessment status" page of "ESS 2025.1"
    And I see an error message stating there are no pending students in "ESS 2025.1"

  Scenario: fail to request self-assessment again from students already requested today
    Given I am logged in as the professor "Paulo Borba", responsible for the class "ESS 2025.1"
    And "ESS 2025.1" has only the students "Bruno Tavares", "Ana Ribeiro" and "Diego Alves"
    And "Ana Ribeiro" and "Diego Alves" do not have a self-assessment registered in "ESS 2025.1"
    And "Ana Ribeiro" and "Diego Alves" have already received a self-assessment request today
    And I am on the "Self-assessment status" page of "ESS 2025.1"
    When I request self-assessment from the pending students of "ESS 2025.1"
    Then I remain on the "Self-assessment status" page of "ESS 2025.1"
    And I see an error message stating that all pending students have already received a request today

   
    And I see an error message stating that all pending students have already received a request today

      Scenario: fail to request self-assessment again from students already requested today
    Given I am logged in as the professor "Paulo Borba", responsible for the class "ESS 2025.1"
    And "ESS 2025.1" has only the students "Bruno Tavares", "Ana Ribeiro" and "Diego Alves"

    When I request self-assessment from the pending students of "ESS 2025.1"
    Then I remain on the "Self-assessment status" page of "ESS 2025.1"
    And I see an error message stating that all pending students have already received a request today