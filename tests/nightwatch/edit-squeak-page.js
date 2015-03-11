module.exports = {
  'Edit Squeak Page' : function (client) {
    client
      .load()

      // Create the standard test squeak
      .createTestSqueak()

      // create test squeak logs out so log back in; use the other user so he can watch it before we edit
      .loginOtherUser()
      .navigateToNewestSqueak()
      .click('.watch-squeak-button')
      .logout()

      // login as the author and navigate to the edit page
      .loginTestUser()
      .navigateToNewestSqueak()
      .waitForElementVisible('#squeak-info', 1000)
      .click('#edit-squeak-button')
      .waitForElementVisible('.squeak-edit-input', 3000)

      // Submitting zero-length stuff should generate errors:
      // title
      .clearValue('#title')
      .setValue('#title', '')
      .click('.submit-update[field=title]')
      .pause(250)
      .assert.containsText('.input-group-message[field=title] span.input-error-message', 'cannot be empty')

      // description
      .clearValue('#description')
      .setValue('#description', '')
      .click('.submit-update[field=description]')
      .pause(250)
      .assert.containsText('.input-group-message[field=description] span.input-error-message', 'cannot be empty')

      // recreation
      .clearValue('#re-creation')
      .setValue('#re-creation', '')
      .click('.submit-update[field=reCreation]')
      .pause(250)
      .assert.containsText('.input-group-message[field=reCreation] span.input-error-message', 'cannot be empty')

      // target
      .clearValue('#target')
      .setValue('#target', '')
      .click('.submit-update[field=target]')
      .pause(250)
      .assert.containsText('.input-group-message[field=target] span.input-error-message', 'cannot be empty')

      // Test that updating the fields actually works:
      .setValue('#title', 'Edited Nightwatch Test Squeak')
      .click('.submit-update[field=title]')
      
      .setValue('#description', 'Test new description')
      .click('.submit-update[field=description]')
      
      .setValue('#re-creation', 'Test new re-creation')
      .click('.submit-update[field=reCreation]')
      
      .setValue('#target', 'Test new target')
      .click('.submit-update[field=target]')

      // Move back to the page and see that the data persisted:
      .click('h3.welcome a')
      .waitForElementVisible('#squeak-page', 3000)

      .assert.containsText('#squeak-page', 'Test new description')
      .assert.containsText('#squeak-page', 'Test new re-creation')
      .assert.containsText('#squeak-page', 'Test new target')

      // Make sure the edit box is showing up
      .assert.containsText('#description-edited', 'Edited')
      .assert.containsText('#target-edited', 'Edited')
      .assert.containsText('#re-creation-edited', 'Edited')

      .assert.containsText('h3.welcome', 'Edited Nightwatch Test Squeak')
      
      // Make sure our activities are showing up
      .click('#view-activity')
      .waitForElementVisible('#activity-list', 3000)
      .assert.containsText('#activity-list div.entry:nth-child(3) .activity-label', 'You changed the target')
      .assert.containsText('#activity-list div.entry:nth-child(3) .edit-new-value', 'Test new target')
      .assert.containsText('#activity-list div.entry:nth-child(3) .edit-previous-value', 'The developers')
      
      .assert.containsText('#activity-list div.entry:nth-child(4) .activity-label', 'You changed the reCreation')
      .assert.containsText('#activity-list div.entry:nth-child(4) .edit-new-value', 'Test new re-creation')
      .assert.containsText('#activity-list div.entry:nth-child(4) .edit-previous-value', 'this test')
      
      .assert.containsText('#activity-list div.entry:nth-child(5) .activity-label', 'You changed the description')
      .assert.containsText('#activity-list div.entry:nth-child(5) .edit-new-value', 'Test new description')
      .assert.containsText('#activity-list div.entry:nth-child(5) .edit-previous-value', 'Nightwatch testing')
      
      .assert.containsText('#activity-list div.entry:nth-child(6) .activity-label', 'You changed the title')
      .assert.containsText('#activity-list div.entry:nth-child(6) .edit-new-value', 'Edited Nightwatch Test Squeak')
      .assert.containsText('#activity-list div.entry:nth-child(6) .edit-previous-value', 'Nightwatch Test Squeak')

      // log in as the other user and make sure that this gives him the correct author names
      .logout()
      .loginOtherUser()
      .click('#view-activity')
      .waitForElementVisible('#activity-list', 1000)
      .assert.containsText('#activity-list div.entry:nth-child(3) .activity-label', 'John Doe changed the target')
      .assert.containsText('#activity-list div.entry:nth-child(4) .activity-label', 'John Doe changed the reCreation')
      .assert.containsText('#activity-list div.entry:nth-child(5) .activity-label', 'John Doe changed the description')
      .assert.containsText('#activity-list div.entry:nth-child(6) .activity-label', 'John Doe changed the title')
      
      // Logout and log in as author to delete
      .logout()
      .loginTestUser()

      // Navigate back and ensure that deletion works
      .click('#view-squeaks')
      .waitForElementVisible('#squeak-list', 1000)
      .click('#sort-squeaks-dropdown')
      .click('#view-newest-squeaks')
      .pause(1000) // wait for page load I guess
      .click('#squeak-list div.squeak-entry:nth-child(3) h3 a')
      .waitForElementVisible('#squeak-page', 3000)
      .click('#edit-squeak-button')
      .waitForElementVisible('.squeak-edit-input', 3000)
      .click('.delete-button')
      .dismissAlert() // make sure it's still there...
      .assert.urlContains('edit_squeak/')
      .click('.delete-button')
      .acceptAlert()
      .pause(100) // gah
      .waitForElementVisible('#squeak-list', 1000)
      .assert.containsText('#squeak-list div:nth-child(1) h3', 'Reducing your mother') // that means this d00d is gone.

      .end();
  }
}