/** 
 * When rendered, disable all inputs
 */
Template.tutorialCommentsPage.rendered = function() { 
  $('#body').attr('disabled', true);
}
/**
 * Helpers for the comment page
 */
Template.tutorialCommentsPage.helpers({
  /**
   * Example clarification comment 
   * @return {Comment} 
   */
  clarificationQuestionExample: function() { 
    return Squeaks.findOne().comments[0];
  },
  /**
   * Civil discourse
   */
  clarificationAnswerExample: function() { 
    return Squeaks.findOne().comments[1];
  },
  /** 
   * Example comment for requesting a change in workflow state
   * @return {comment} 
   */
  workflowRequestExample: function() { 
    return Squeaks.findOne().comments[2];
  },
  /**
   * Civil discourse
   */
   workflowResponseExample: function() { 
    return Squeaks.findOne().comments[3];
   }
});