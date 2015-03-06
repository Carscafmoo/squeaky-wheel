/**
 * A dictionary mapping the parameters to the display text
 * @type {Object}
 */
var dictionary = {
  n: 'name',
  p: 'popularity'
};
/**
 * Helpers for axle sort dropdown
 * @author  moore
 */
Template.sortAxlesDropdown.helpers({
  current: function() { 
    return dictionary[Session.get('axleListSorting')];
  },
  /**
   * Do we need to display an option?
   * @param  {String} that The option we do or do not need to display
   * @return {Boolean}       
   */
  needToDisplay: function(that) { 
    return !Session.equals('axleListSorting', that);
  },
  /** 
   * return the link text given the resolution key
   * @param  {String} key The key
   * @return {String}     The link text
   */
  text: function(key) { 
    return dictionary[key];
  }
});
/**
 * Axle sort events are held in axle-view-helpers to avoid a global variable
 */