/**
 * Helper for axle list page
 */
Template.tutorialAxleListPage.helpers({
  /**
   * Set up the Squeaks list page so it is restricted only to our Axle
   */
  getSqueaks: function() { return Squeaks.find(); }
});