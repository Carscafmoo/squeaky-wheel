/**
 * We use a few Session variables to pass info to the modal state change dialog.  Clear these on creation and destruction
 */
Template.workflowMenu.created = function() { 
  Session.set('stateChangeModalTitle', null);
  Session.set('stateChangeNextState', null);
  Session.set('stateChangeAction', null);
}
/**
 * We use a few Session variables to pass info to the modal state change dialog.  Clear these on creation and destruction
 */

Template.workflowMenu.destroyed = function() { 
  Session.set('stateChangeModalTitle', null);  
  Session.set('stateChangeNextState', null);
  Session.set('stateChangeAction', null);
}
/**
 * Private function for this to be used in the helpers.
 * @param {Squeak} squeak
 * @author moore
 */
var workflowStateOptions = function workflowStateOptions(squeak) { 
  var user = Meteor.userId();
  var options = [];
  if ( squeak.state === 'Greased') { return options; }
  
  if (squeak.state === 'Squeaky') { 
    options.push({display: 'Take to the shop', action: 'takeSqueakToShop', newState: 'In the shop'});
    options.push({display: 'Submit for inspection', action: 'proposeSqueakSolution', newState: 'Under inspection'});

    if (user === squeak.author) { options.push({display: 'Declare greased', action: 'declareSqueakGreased', newState: 'Greased'}); }
  }

  if (squeak.state === 'In the shop') { 
    if (user === squeak.mechanic) { 
      options.push({display: 'Let someone else try', action: 'declareSqueakSqueaky', newState: 'Squeaky'});
      options.push({display: 'Submit for inspection', action: 'proposeSqueakSolution', newState: 'Under inspection'}); 
    }
  }

  if (squeak.state === 'Under inspection') { 
    if (user === squeak.author) { 
      options.push({display: 'Resubmit to mechanic', action: 'takeSqueakToShop', newState: 'In the shop'});
      options.push({display: 'Pass inspection', action: 'declareSqueakGreased', newState: 'Greased'});
      options.push({display: 'Reject work', action: 'declareSqueakSqueaky', newState: 'Squeaky'});
    }
  }

  return options;
}
/**
 * Helpers for the workflow menu template (workflow-menu-template.html)
 * @author moore
 */
Template.workflowMenu.helpers({
  /**
   * Can the user edit the workflow in its current state?
   * @return {Boolean} true if he or she can, false if he or she cannot.
   */
  canEditWorkflow: function() { 
    return !!workflowStateOptions(this).length;
  },
  /**
   * Determine the workflow state change options given the current user, the Squeaks assigned roles, and the current state.
   * @return {[String]} An array of options to change the workflow to.  Empty array if none exist.
   */
  workflowStateOptions: function() { 
    return workflowStateOptions(this);
  },
  /**
   * Give an explanation of the workflow state in scrollover
   */
  workflowTitle: function() { 
    return workflowExplanation(this.state);
  }
});
/**
 * Event handlers for the template
 * @author  moore
 */
Template.workflowMenu.events({
  /**
   * When you click the workflow menu state change options, you should generate a form asking for more information... I guess?
   */
  'click .state-change-option li a': function(event) { 
    var $target = $(event.currentTarget);
    Session.set('stateChangeModalTitle', $target.text());
    Session.set('stateChangeNextState', $target.attr('newState'));
    Session.set('stateChangeAction', $target.attr('action'));
  }

})