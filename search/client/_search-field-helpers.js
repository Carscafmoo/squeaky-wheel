/**
 * Convert this object into text
 * @type String
 */
var text = function text(_this) { return _this.toString(); }// have to get acces to this from inside the helpers :-( :-(
/**
 * The name of the session var containing info about this particular field
 */
var seshVar = function seshVar(_this) { return 'searchFor' + text(_this); }
/**
 * On creation of this bad boy, set the default session var for whether or not we're searching for this particular field
 */
Template._searchField.created = function() {
  Session.setDefault(seshVar(this.data), true);
}
/**
 * Helpers for the search field template (_search-field-template.html)
 */
Template._searchField.helpers({
  /**
   * Determine if the current field is active or not, and say whether it should be checked or not
   * @return {String} [description]
   */
  checked: function() { 
    return Session.equals(seshVar(this), true) ? 'checked' : '';
  },
  /**
   * Text to display for each field
   * @return 
   */
  text: function() { 
    return text(this);
  }
});
/**
 * Event listeners
 */
Template._searchField.events({
  /**
   * Stop clicking an li from closing the dialog, and instead have it update session vars as appropriate
   */
  'click .search-option': function(event) { 
    var isChecked = $(event.currentTarget).find('input').is(':checked');
    
    event.stopPropagation();
    Session.set('retriggerSearch', true); // This will trigger the search on close of the dropdown
    Session.set(seshVar(this), isChecked); // This gets read in the parent template and dealt with prior to triggering search
  }
});