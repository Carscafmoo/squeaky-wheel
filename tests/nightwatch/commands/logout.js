/**
 * Logs out the currently logged-in user.  Assumes a user is logged in.
 * @return {Object} this for chaining.
 * @author  moore
 */
module.exports.command = function(callback) {
  var self = this;
  
  self.click('#login-buttons-dropdown a')
      .waitForElementVisible('#login-buttons-logout', 3000)
      .click('#login-buttons-logout')
      .pause(100) // i don't know why we have to do this and it drives me nuts
      .waitForElementVisible('#welcome-text', 3000)
  
  return this; // allows the command to be chained.
};
