module.exports = {
  'Edit Profile Page' : function (client) {
    client
      .load()
      .assert.visible('.welcome') // Should display the welcome div as part of the login page

      // Login as test user
      .click('#login-buttons-dropdown a') // begin login sequence
      .waitForElementVisible('#login-username', 1000)
      .assert.elementNotPresent('#login-buttons-edit-profile') // should only be visible if you're already logged in
      .setValue('#login-username', 'fake_user') 
      .setValue('#login-password', 'test123') 
      .click('#login-buttons-password')
      .waitForElementPresent('div.has-error', 1000)
      .assert.containsText('.has-error .input-error-message', 'User not found')
      .clearValue('#login-username')
      .setValue('#login-username', 'test_user')
      .click('#login-buttons-password')
      .waitForElementPresent('#squeak-list', 5000) // Wait for squeak list to show up -- usually on the first run this times out?
      .assert.containsText('#login-dropdown-toggle', 'John Doe') // Might not be able to do this...

      // Navigate from the homepage
      .click('#login-buttons-dropdown a')
      .waitForElementVisible('#login-buttons-edit-profile', 1000)
      .click('#login-buttons-edit-profile')
      .waitForElementVisible('#user-update-form', 1000)
      .assert.urlContains('edit_profile')

      // Test that the editing functions work:
      .setValue('#input-user-name', 'Test Name Change')
      .click('#submit-name-update')
      .setValue('#input-user-email', 'TestEmail@gmail.com')
      .click('#submit-email-update')

      // refresh page and see if it persisted
      .refresh()
      .pause(3000) // wait for the page to actually refresh...

      
      .assert.attributeEquals('#input-user-name', 'placeholder', 'Test Name Change')
      .assert.attributeEquals('#input-user-email', 'placeholder', 'TestEmail@gmail.com')

      // test out password resetting
      .assert.cssClassPresent('#submit-new-password', 'disabled')
      .setValue('#input-old-password', 'test123')
      .assert.cssClassPresent('#submit-new-password', 'disabled')
      .setValue('#input-new-password', 'test789')
      .assert.cssClassPresent('#submit-new-password', 'disabled')
      .setValue('#confirm-new-password', 'test789')
      .assert.cssClassNotPresent('#submit-new-password', 'disabled')
      .setValue('#input-new-password', 'test456') // make sure it re-disables itself if the PWs don't match
      .assert.cssClassPresent('#submit-new-password', 'disabled')
      .clearValue('#input-new-password')
      .setValue('#input-new-password', 'test789')
      .assert.cssClassNotPresent('#submit-new-password', 'disabled')
      .click('#submit-new-password')

      // Test to make sure that it worked
      .logout()
      
      // While we're logged out, make sure we can't still edit
      .assert.urlContains('welcome')
      .assert.elementNotPresent('#input-user-name')
      .assert.elementNotPresent('#input-user-email')
     
      .click('#login-buttons-dropdown a') // begin login sequence
      .waitForElementVisible('#login-username', 1000)
      .setValue('#login-username', 'test_user') 
      .setValue('#login-password', 'test789') // new password
      .click('#login-buttons-password')
      
      // revert
      .pause(1000) // wait for login to take effect?
      .click('#login-buttons-dropdown a')
      .waitForElementVisible('#login-buttons-edit-profile', 1000)
      .click('#login-buttons-edit-profile')
      .waitForElementVisible('#user-update-form', 1000)
      .assert.urlContains('edit_profile')

      .setValue('#input-user-name', 'John Doe')
      .click('#submit-name-update')
      .setValue('#input-user-email', 'test@squeak-wheel.com')
      .click('#submit-email-update')
      .setValue('#input-old-password', 'test789')
      .setValue('#input-new-password', 'test123')
      .setValue('#confirm-new-password', 'test123')
      .click('#submit-new-password')

      .end();
  }
}