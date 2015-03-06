/**
 * Helpers for the author template
 * @author moore
 */
Template.authorSpan.helpers({
  /**
   * Return the user's viscosity rating:
   */
  viscosity: function() { return calculateViscosityRating(this); }
});