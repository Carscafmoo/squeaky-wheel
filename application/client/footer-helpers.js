/**
 * Helpers for the footer template
 */
Template.footer.helpers({
  /**
   * Divide the links in the template
   * @return {String} The character used to divide the links in the footer
   */
  divider: function() { return '|'; },
  /**
   * What is the current year?
   */
  year: function() { return new Date().getFullYear(); }
});
/**
 * Event handlers
 */
Template.footer.events({
  /**
   * When you click on a link, it should scroll to the top of the page
   */
  'click a': function(event) { 
    $('html, body').scrollTop(0);
  }
});
