/**
 * Disable all the bells and whistles
 */
Template.tutorialSqueakPage.rendered = function() { 
  $('#squeak-info button').addClass('disabled').attr('disabled', true);
  $('#squeak-info a').addClass('disabled');
  $('#workflow-transition-dropdown-button').removeClass('disabled').attr('disabled', false); // Actually let them play around with that
}
/**
 * Helpers for the squeak page tutorial 
 */
Template.tutorialSqueakPage.helpers({
  exampleSqueak: function() { return Squeaks.findOne({}); }
});