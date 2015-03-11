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