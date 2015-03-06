module.exports = {
  "Squeak Creation" : function (client) {
    client
      .load()
      
      // Login as test user
      .loginTestUser()
      
      // Navigate to Squeak creation page
      .click("#new-squeak")
      .waitForElementVisible("#new-squeak-form", 1000)
      .assert.urlContains("/create_squeak")

      // Make sure the squeak submission is disabled if we don't have a full Squeak:
      .assert.cssClassPresent('#submit-new-squeak', 'disabled')
      .click('#submit-new-squeak')
      .pause(500)
      .assert.urlContains("/create_squeak")

      // Go ahead and create a Squeak and submit it
      .setValue("#title", "Nightwatch Test Squeak")
      .setValue("#description", "This is a Test Squeak created as part of Nightwatch testing")
      .setValue("#re-creation", "Recreate this by re-running the new-squeak test")
      .assert.cssClassPresent('#submit-new-squeak', 'disabled') // still disabled
      .setValue("#target", "Developers of Squeaky-Wheel")
      .assert.cssClassNotPresent('#submit-new-squeak', 'disabled') // enabled!
      .click("#submit-new-squeak")

      // Test that successfully navigated to Squeak page
      .waitForElementVisible("#squeak-info", 1000)
      .assert.urlContains("/squeak/")

      // Delete here to clean up after yourself...
      .deleteSqueak()
      .end();
  }
}