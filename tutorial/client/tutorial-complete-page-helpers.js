/**
 * Helpers for the tutorial done page
 */
Template.tutorialCompletePage.helpers({
  tutorialLink: function() { 
    return $('#tutorial-footer-link').text();
  }
});
/**
 * Event handlers
 */
Template.tutorialCompletePage.events({
  'click #get-started-button': function(event) { 
    event.preventDefault();
    Router.go('home');
  }
});