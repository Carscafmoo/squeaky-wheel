/**
 * A list of helpers for dealing with displaying workflow state
 * @author  moore
 */
Template.workflowState.helpers({
  /**
   * Translate the Squeak state into something slightly more helpful (in the case of rejected Squeaks)
   * @return {String}
   */
  translateState: function() { 
    if ( this.state === 'Rejected') { 
      return _.findWhere(_.sortBy(this.motions, 'resolved').reverse(), {state: 'Accepted'}).reason;
    } else { 
      return this.state;
    }
  },
  /**
   * Give an explanation of the workflow state in scrollover
   */
  workflowTitle: function() { 
    return workflowExplanation(this.state);
  }
});