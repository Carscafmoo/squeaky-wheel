/**
 * If we're in tutorial mode, disable all your links and buttons
 */
Template._squeak.rendered = function() { 
  if ( Session.equals('isTutorial', true) ) { 
    $('.squeak-entry a').addClass('disabled');
    $('.squeak-entry button').addClass('disabled');
    $('.squeak-entry button').attr('disabled', true); // do both to get the glyphicon watch button for some reason?
  }
  
}
/**
 * A list of helpers for dealing with displaying individual Squeaks (_squeak-template.html)
 * @author  moore
 */
Template._squeak.helpers({
  /**
   * Give an explanation of the workflow state in scrollover
   */
  workflowTitle: function() { 
    return workflowExplanation(this.state);
  }
});