/**
 * If we're in the tutorial, disable all the links 
 */
Template._axle.rendered = function() { 
  if (Session.equals('isTutorial', true)) { 
    $('.axle-entry a').addClass('disabled'); 
    $('.axle-entry button').addClass('disabled');
    $('.axle-entry button').attr('disabled', true);
  }
}
/**
 * Deal with correct routing on the axle view template
 * @author moore
 */
Template._axle.events({
  'click .axle-entry-link': function(event) { 
    Session.set('squeakListAxle', $(event.currentTarget).text());
  }
});