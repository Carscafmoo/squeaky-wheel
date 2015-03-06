/**
 * On render, disable all of the workflow transition menu stuff
 */
Template.tutorialSqueakWorkflowPage.rendered = function() { 
  $.each($('.state-change-option a'), function() { $(this).addClass('disabled'); });
}
/**
 * Helpers for the squeak workflow template
 */
Template.tutorialSqueakWorkflowPage.helpers({
  /**
   * Return a fake Squeak with relevant data to generate the workflow state dropdown
   * @type {Object}
   */
  exampleSqueak: function() { 
    var user = Meteor.userId();
    return {state: 'Squeaky', author: (user ? user : ''), mechanic: null}; 
  }, 
  /** 
   * Greased reason explanations
   * @return {[Object]} in format { reason: (grease reason), explanation: String }
   */
  greasedExplanations: function() { 
    return [
      {reason: "Withdrawn", explanation: "The author has determined that this is not truly a problem." },
      {reason: "Offensive", explanation: "The subject matter of the Squeak did not conform to community standards."},
      {reason: "Unproductive", explanation: "The discussion on the Squeak or the Squeak itself was not productive; no solution was possible."},
      {reason: "Passed inspection", explanation: "The original Squeak author has accepted a solution to his or her problem." }
    ];
  },
  /** 
   * Workflow explanations
   * @return {[Object]} in format { state: (workflow state), explanation: String }
   */
  workflowExplanations: function() { 
    return [
      { state: "Squeaky", explanation: "A problem that has been reported and is still active.  No one has stepped up to solve it yet." },
      { state: "In the shop", explanation: "A Mechanic has volunteered to try to solve this problem and is actively working on it." },
      { state: "Under inspection", 
        explanation: "The work done by the Mechanic is being inspected; this problem may be solved, but the original author needs to accept the solution." },
      { state: "Greased", explanation: "This problem has been solved!" }
    ]
  }
});