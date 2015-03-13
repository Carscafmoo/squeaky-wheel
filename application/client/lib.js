/**
 * A library of useful functions for the client
 * @author  moore
 */
/**
 * Return a single date in the correct format.
 * @param  {Date} date The Date to transform
 * @return {String}      The String representation of that Date.*
 */
dateFormat = function dateFormat(date) { 
  var mome = moment(date);

  return 'on ' + mome.format('MMM Do YYYY') + ' at ' + mome.format('h:mm A');
}
/**
 * Register dateformat as a helper on all templates
 */
Template.registerHelper('dateFormat', function(date) { 
  return dateFormat(date);
});
/**
 * Helper for setting the title of a page from within a template
 * @param  {String} title The string to set the title to
 */
Template.registerHelper('setTitle', function(title) { 
  document.title = title;
});
/**
 * Possessive-izing a name
 * @param  {String} whose The name to make possessive, e.g,. 'John Doe,' 'me,' 'you'
 * @return {String} The possessive of whose, e.g., 'John Doe's', 'my', 'your'
 */
possessivize = function possessivize(whose) { 
  if (whose.toLowerCase() === 'me') { return whose.charAt(0) + 'y'; }
  if (whose.toLowerCase() === 'you') { return whose + 'r'; } 

  return whose + '\'s';
}
/**
 * Capitalize the first letter of a word
 */
String.prototype.capitalize = function(what) { 
  return this.charAt(0).toUpperCase() + this.slice(1)
}