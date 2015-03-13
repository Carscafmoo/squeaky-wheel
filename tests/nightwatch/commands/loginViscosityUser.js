/**
 * Logs the user in as a viscosity user.  Assumes no user is logged in.
 * @param {which} One of 'low', 'med', or 'high' indicating which VR user to log in as
 * @return {Object} this for chaining.
 * @author  moore
 */
module.exports.command = function(which, callback) {
  var self = this;
  var username = 'wd_0';
  var pass = 'easygreasy0'; // default to the low one I guess?

  if (which === 'med') { 
    username = 'wd_500';
    pass = 'easygreasy500';
  } else if (which === 'high') { 
    username = 'wd_5000';
    pass = 'easygreasy5000';
  }

  
  self.click('#login-buttons-dropdown a') // open login dropdown
      .waitForElementVisible('#login-username', 1000)
      .setValue('#login-username', username) 
      .setValue('#login-password', pass)
      .click('#login-buttons-password')
      .waitForElementPresent('.welcome', 5000) // Wait for squeak list to show up -- usually on the first run this times out
      .pause(100); // wait for the login event handlers to run
  
  return this; // allows the command to be chained.
};
