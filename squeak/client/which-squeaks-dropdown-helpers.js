/**
 * On creation, set the default (if it doesn't exist) for the Session var we're watching
 */
Template.whichSqueaksDropdown.created = function() { 
  Session.setDefault('squeakListWhich', 'a');
}
/**
 * If we're in tutorial mode, kill the links
 */
Template.whichSqueaksDropdown.rendered = function() { 
  if (Session.equals('isTutorial', true)) { $('.squeak-list-which-link').addClass('disabled'); }
}
/**
 * A dictionary mapping the parameters to the display text
 * @type {Object}
 */
var dictionary = {
  a: 'all',
  m: 'my',
  w: 'watched'
};
/**
 * Reverse dictionary, for looking up the key given the text
 */
var rev = {};
for ( key in dictionary ) { 
  rev[dictionary[key]] = key;
}
/**
 * Helpers for the whichSqueaksDropdown template
 */
Template.whichSqueaksDropdown.helpers({
  current: function() { 
    return dictionary[Session.get('squeakListWhich')];
  },
  /**
   * Do we need to display an option?
   * @param  {String} that The option we do or do not need to display
   * @return {Boolean}       
   */
  needToDisplay: function(that) { 
    return !Session.equals('squeakListWhich', that);
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
 * Event handlers
 * @author  moore
 */
Template.whichSqueaksDropdown.events({
  /**
   * Clicking on one of the links should just set the Session var accordingly
   * 
   */
  'click .squeak-list-which-link': function(event) { 
    event.preventDefault();
    
    return Session.set('squeakListWhich', rev[$(event.currentTarget).text().trim()]);
  }
})