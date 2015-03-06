/**
 * Helpers for the header template (header-template.html)
 * @author moore
 */

/**
 * Determine if a given route is the active route and return its CSS class
 * Available to all templates.
 * @return String the class associated with the route in question
 */
Template.registerHelper('activeRouteClass', function(/* Takes any # of arguments*/) {
  if (!Meteor.userId()) { return 'disabled'; }

  var args = Array.prototype.slice.call(arguments, 0);
  var active; 
  
  args.pop(); // remove the trivial arg
  
  active = _.any(args, function(name) {
    return Router.current() && Router.current().route.getName() === name
  });

  return active && 'current-route'; // you'll need to do something in CSS about current-route
});
/**
 * Helpers
 */
Template.header.helpers({
  /**
   * Specifically for the search bar -- if we're not logged in, disable it
   * @return {String} [description]
   */
  searchDisabled: function() { 
    return (Meteor.userId() ? '' : 'disabled');
  }
});
/**
 * Event handler for search redirection when the form is submitted -- trigger the search and redirect to the results page
 * @author  moore
 */
Template.header.events({
  'submit #header-search-form': function(event) { 
    event.preventDefault();
    // Navigate to the search page and trigger the search...
    Router.go('searchPage', {}, {query: "s=" + $('#header-search-input').val() });
    $('#header-search-input').val(''); // clear the header search after submission
  }
});