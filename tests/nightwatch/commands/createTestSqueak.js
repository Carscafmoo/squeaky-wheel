/**
 * Create a standard test Squeak.  Assumes the user is logged out; logs the user in as the test user,
 *   creates the Squeak, then logs back out.
 * @param  {Function} callback 
 * @return object this for chaining.
 * @author  moore
 */
module.exports.command = function(callback) {
  var self = this;
  
  self.loginTestUser()
      .pause(500) // for some reason we need to wait a bit which is really annoying
      .click('#new-squeak')
      .waitForElementVisible('#new-squeak-form', 3000)
      .setValue('#title', 'Nightwatch Test Squeak ' + Math.random())
      .setValue('#description', 'This is a Test Squeak created as part of Nightwatch testing')
      .setValue('#re-creation', 'Re-run this test to recreate this Squeak')
      .setValue('#target', 'The developers of Squeaky Wheel')
      .click('#submit-new-squeak')
      .logout();

  
  return this; // allows the command to be chained.
};
