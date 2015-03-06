/**
 * On creation, set the default (if it doesn't exist) for the Session var we're watching
 */
Template.squeakWorkflowDropdown.created = function() { 
  Session.setDefault('squeakListResolution', 'a');
}
/**
 * If we're in tutorial mode, kill the links
 */
Template.squeakWorkflowDropdown.rendered = function() { 
  if (Session.equals('isTutorial', true)) { $('.squeak-list-workflow-link').addClass('disabled'); }
}
/**
 * A dictionary mapping the parameters to the display text
 * @type {Object}
 */
var dictionary = {
  a: 'in any state',
  g: 'greased',
  i: 'under inspection',
  s: 'currently squeaking',
  sh: 'in the shop'
};
/**
 * Reverse dictionary, for looking up the key given the text
 */
var rev = {};
for ( key in dictionary ) { 
  rev[dictionary[key]] = key;
}
/**
 * 
 * @param  {[type]} ) {                var param [description]
 * @return {[type]}   [description]
 */
Template.squeakWorkflowDropdown.helpers({
  current: function() { 
    return dictionary[Session.get('squeakListResolution')];
  },
  /**
   * Do we need to display an option?
   * @param  {String} that The option we do or do not need to display
   * @return {Boolean}       
   */
  needToDisplay: function(that) { 
    return !Session.equals('squeakListResolution', that);
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
Template.squeakWorkflowDropdown.events({
  /**
   * Clicking on one of the links should just set the Session var accordingly
   * 
   */
  'click .squeak-list-workflow-link': function(event) { 
    event.preventDefault();
    
    return Session.set('squeakListResolution', rev[$(event.currentTarget).text().trim()]);
  }
})