module.exports = {
  'Create Account Page' : function (client) {
    client
      .load()
      .assert.visible('.welcome') // Should display the welcome div as part of the login page
      .assert.visible('.welcome a')
      .assert.containsText('.welcome a', 'create an account')

      // Login as test user
      .click('#login-buttons-dropdown a') // open login dropdown
      .waitForElementVisible('#login-username', 1000)
      .assert.elementPresent('#login-other-options a')
      .assert.containsText('#login-other-options', 'Create account')
      .click('#signup-link')
      
      .waitForElementVisible('#new-username', 2000)
      .assert.urlContains('create_account')
      .assert.cssClassPresent('#submit-new-user', 'disabled') // This should be disabled right up til the end
      .setValue('#new-username', 'test_user' + Math.random()) // So we don't overlap... there's no user destroy button ... yet??
      .assert.cssClassPresent('#submit-new-user', 'disabled') // This should be disabled right up til the end
      .setValue('#new-password', 'test') // Should create an error...
      .click('#confirm-password') // shouldn't do anything, but should clear focus from #new-password to trigger change event
      .waitForElementPresent('div.has-error', 1000) // Should be an error on the confirm-password
      .assert.containsText('.has-error .input-error-message', 'Password must be') // there should be an error message showing up
      .clearValue('#new-password')
      .setValue('#new-password', 'test789')
      .click('#confirm-password') // shouldn't do anything, but should clear focus from #new-password to trigger change event
      .pause(500) // just in case
      .assert.elementNotPresent('.has-error') // Should not be an error on the confirm-password
      .assert.cssClassPresent('#submit-new-user', 'disabled') // This should be disabled right up til the end
      .setValue('#confirm-password', 'test789')
      .assert.cssClassPresent('#submit-new-user', 'disabled') // This should be disabled right up til the end
      .setValue('#new-user-name', 'Nightwatch Test User')
      .assert.cssClassPresent('#submit-new-user', 'disabled') // This should be disabled right up til the end
      .setValue('#new-user-email', 'test@squeaky-wheel.com')
      .assert.cssClassNotPresent('#submit-new-user', 'disabled') // This should be enabled now
      
      .setValue('#confirm-password', 'testtest')
      .assert.cssClassPresent('#submit-new-user', 'disabled') // This should be disabled b/c pw's don't match
      /* Can't trigger change event for some reason.  We should deal with this:
       *    https://groups.google.com/forum/#!topic/nightwatchjs/RQEmKrZ-cSY
       *    .waitForElementPresent('.has-error', 1000) // Should be an error on the confirm-password
       *   .assert.containsText('.has-error .input-error-message', 'Passwords do not match') // there should be an error message showing up
       */
     .clearValue('#confirm-password')
      .setValue('#confirm-password', 'test789')
      .assert.cssClassNotPresent('#submit-new-user', 'disabled') // This should be enabled now that they do

      // Submit the form and make sure it logs in the user and goes to the homepage
      .click('#submit-new-user')
      .waitForElementVisible('#tutorial-header', 5000)
      .assert.containsText('#login-dropdown-toggle', 'Nightwatch Test User')
      .click('#view-activity')
      .waitForElementVisible('#activity-list', 3000)
      .assert.containsText('.entry-content label', 'You joined')

      .end();
  }
}