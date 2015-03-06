/**
 * Delete the current Squeak.  Assumes the user is logged in as the Squeak author and on a Squeak page
 * @param  {Function} callback 
 * @return object this for chaining.
 * @author  moore
 */
module.exports.command = function(callback) {
  var self = this;
  
  self
    .click('#edit-squeak-button')
    .waitForElementVisible('.squeak-edit-input', 3000)
    .click('.delete-button')
    .acceptAlert()
    .waitForElementVisible('#squeak-list', 3000);
  
  return this; // allows the command to be chained.
};
