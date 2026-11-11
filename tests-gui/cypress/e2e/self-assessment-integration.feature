Feature: Integration between the self-assessment page and the self-assessment service

  As a student enrolled in a class
  I want the concepts I register on the page to reach the self-assessment service
  So that my self-assessment is not lost and is validated by the same rules everywhere

  Background:
    Given the student "Bruno Tavares" has no concept registered in the self-assessment service
    And I am on the "My self-assessment" page served by the self-assessment service

  Scenario: the concept registered on the page reaches the service and comes back from it
    When I assign the concept "MPA" to the goal "Specify requirements with quality"
    And I save my self-assessment
    Then I see a confirmation message that my self-assessment was saved
    And I see the concept "MPA" registered for the goal "Specify requirements with quality"
    And the service has the concept "MPA" stored for the goal "Specify requirements with quality"
    When I remove the concept of the goal "Specify requirements with quality"
    And I save my self-assessment
    Then I see the goal "Specify requirements with quality" with no concept registered
    And the service has no concept stored for the goal "Specify requirements with quality"

  Scenario: the page shows the rejection that comes from the service
    When I assign the concept "XYZ" to the goal "Write quality tests"
    And I save my self-assessment
    Then I see an error message stating that "XYZ" is not a valid concept
    And I see that the accepted concepts are "MA", "MPA" and "MANA"
    And the service has no concept stored for the goal "Write quality tests"
