/**
 * Comment on the current Squeak.  Assumes a logged-in user and that the user is on the Squeak page.
 * @param  {Function} callback 
 * @return object this for chaining.
 * @author  moore
 */
module.exports.command = function(comment, callback) {
  var self = this;
  
  self
      .setValue('#body', comment)
      .click('#submit-comment')
      .pause(100); // wait for the comment to register and the body to come back
  
  return this; // allows the command to be chained.
};
