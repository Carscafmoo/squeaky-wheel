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

  return 'on ' + mome.format('MMM Do YYYY') + ' at ' + mome.format('h:mm:ss A');
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