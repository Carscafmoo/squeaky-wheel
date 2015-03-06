/**
 * Logs the user in as the *other* test user.  Assumes no user is logged in.
 * @return {Object} this for chaining.
 * @author  moore
 */
module.exports.command = function(callback) {
  var self = this;
  self.click("#login-buttons-dropdown a") // open login dropdown
      .waitForElementVisible("#login-username", 1000)
      .setValue('#login-username', 'test_user1') 
      .setValue('#login-password', 'test456')
      .click('#login-buttons-password')
      .waitForElementPresent(".welcome", 5000) // Wait for squeak list to show up -- usually on the first run this times out
      .pause(100); // wait for event handlers to run
  
  return this; // allows the command to be chained.
};
