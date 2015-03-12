/**
 * On render, disable all of the workflow transition menu stuff
 */
Template.tutorialSqueakWorkflowPage.rendered = function() { 
  $('#squeak-workflow-example a').addClass('disabled');
  $('#squeak-workflow-example button').addClass('disabled');
  $('#squeak-workflow-example button').attr('disabled', true);
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
    return Squeaks.findOne();
  }, 
  /**
   * reasons a Squeak might be rejected
   * @return {[Object]}
   */
  rejectionReasons: function() { 
    return [{reason: "Withdrawn", explanation: "The author has determined that this is not truly a problem." },
          {reason: "Duplicate", explanation: "This Squeak is similar or identical to another, existing Squeak." },
          {reason: "Unproductive", explanation: "The discussion on the Squeak or the Squeak itself was not productive; no solution is possible."},
          {reason: "Offensive", explanation: "The subject matter of the Squeak did not conform to community standards."}]
  },
  /** 
   * Workflow explanations
   * @return {[Object]} in format { state: (workflow state), explanation: String }
   */
  workflowExplanations: function() { 
    return [
      { state: "Squeaky", 
        explanation: "This problem is still active.  No one has stepped up to solve it yet." },
      { state: "Under inspection", 
        explanation: "This Squeak is undergoing Squeaky Wheel's 1000-point inspection: there is an open proposal to change its workflow state." },
      { state: "Greased", 
        explanation: "This problem has been solved!" },
      { state: "Rejected", 
        explanation: "This problem does not conform to the community's standards." }
    ]
  }
});