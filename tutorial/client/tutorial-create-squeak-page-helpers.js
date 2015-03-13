/**
 * On render, disable all of the form elements
 */
Template.tutorialCreateSqueakPage.rendered = function() { 
  $('#new-squeak-form input').attr('disabled', true);
  $('#new-squeak-form textarea').attr('disabled', true);
}
/**
 * Helpers for the create squeak page tutorial
 */
Template.tutorialCreateSqueakPage.helpers({
  /**
   * 
   * @return {String} the text from the Squeak link
   */
  createSqueakText: function() { 
    return 'Squeak!'; // $('#new-squeak').text() yields Squeak!Be Heard which is not great
  }
});