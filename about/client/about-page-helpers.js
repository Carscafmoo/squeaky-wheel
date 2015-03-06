/**
 * Event handlers for the about page template
 * @author moore
 */
Template.aboutPage.events({
  /**
   * When a learn more button is clicked, route to that page and scroll to the top
   */
  'click .learn-more-button': function(event) { 
    event.preventDefault();
    Router.go($(event.currentTarget).attr('route'));
    $('html, body').scrollTop(0);
  }
});
