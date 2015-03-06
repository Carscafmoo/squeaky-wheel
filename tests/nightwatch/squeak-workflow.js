module.exports = {
  'Squeak Workflow' : function (client) {
    client
      .load()

      // Create the standard test squeak
      .createTestSqueak()

      // create test squeak logs out so log back in...
      .loginTestUser()
      .navigateToNewestSqueak()
      
      // Test to see that user can change the Squeak workflow:
      .assert.visible("#workflow-transition-dropdown-button")
      .assert.containsText('#workflow-transition-dropdown-button', 'Squeaky')
      .assert.containsText('#workflow-meta', 'Created by') // should not indicate a state change

      // The author can now resolve to all states:
      .click("#workflow-transition-dropdown-button")
      .waitForElementVisible(".state-change-option li a[action=takeSqueakToShop]", 1000)
      .assert.visible(".state-change-option li a[action=proposeSqueakSolution]")
      .assert.visible(".state-change-option li a[action=declareSqueakGreased]")

      // Check and see what options are available for closure -- we shouldn't be able to accept a solution
      .click('.state-change-option li a[action=declareSqueakGreased]')
      .waitForElementVisible('#state-change-modal-form', 1000)
      .assert.elementPresent('#reason-select option[value=Withdrawn]')
      .assert.elementPresent('#reason-select option[value=Unproductive]')
      .assert.elementPresent('#reason-select option[value=Offensive]')
      .assert.elementNotPresent('#reason-select option[value="Passed inspection"]')
      .click('#cancel-state-change-button')
      .pause(1000) // wait for everything to clear up
      
      // Now logout and log in as the other user. he should have fewer options in terms of what he can do:
      .logout()
      .loginOtherUser()
      .navigateToNewestSqueak()
      .click("#workflow-transition-dropdown-button")
      .waitForElementVisible(".state-change-option li a[action=takeSqueakToShop]", 1000)
      .assert.visible(".state-change-option li a[action=proposeSqueakSolution]")
      .assert.elementNotPresent(".state-change-option li a[action=declareSqueakGreased]")

      // Have him propose a solution
      .click(".state-change-option li a[action=proposeSqueakSolution]")
      .waitForElementVisible('#state-change-modal-form', 1000)
      .assert.elementNotPresent('#reason-select')
      .assert.cssClassPresent('#submit-state-change-button', 'disabled') // should be disabled to begin with, since it's required
      
      // Go ahead and test that the enabling and disabling works
      .setValue('#state-change-comment', 'a')
      .assert.cssClassNotPresent('#submit-state-change-button', 'disabled')
      .clearValue('#state-change-comment') // I can't get it to trigger keyup, so I've gotten rid of the next line lines
      // .assert.cssClassPresent('#submit-state-change-button', 'disabled') // should be disabled to begin with, since it's required
      .setValue('#state-change-comment', 'Nightwatch may actually be able to take care of this issue for us')
      .click('#submit-state-change-button')
      .pause(1000) // let that go through I guess
      
      // Test that the page updated appropriately
      .assert.elementNotPresent('#workflow-transition-dropdown-button') // should now just be text, other user can't do anything
      .assert.containsText('#workflow-state', 'Under inspection') // should display the correct text
      .assert.containsText('#workflow-meta', 'completed work') // should now mention the work being completed at a certain time
      .assert.elementPresent('.squeak-resolution') // Should have popped up under resolutions
      .assert.elementPresent('.resolution-active') // Should be active
      .assert.containsText('.resolution-active', 'Nightwatch may actually be') // Should tell us what the proposal is
      .assert.containsText('#squeak-resolutions span.resolution-meta:nth-child(1)', 'proposed the following') // Should have the meta info

      // There should not be a load-more button yet
      .assert.elementNotPresent('#show-all-resolutions')

      // logout and log back in as the test user to reject this 
      .logout()
      .loginTestUser()
      .navigateToNewestSqueak()
      .assert.elementPresent('#workflow-transition-dropdown-button') // this should be a button for the author
      .click('#workflow-transition-dropdown-button')
      .waitForElementVisible(".state-change-option li a[action=takeSqueakToShop]", 1000)
      .assert.visible(".state-change-option li a[action=declareSqueakSqueaky]") // all three options should still be available
      .assert.visible(".state-change-option li a[action=declareSqueakGreased]")
      .click('.state-change-option li a[action=takeSqueakToShop]') // reject his solution
      .waitForElementVisible('#state-change-modal-form', 1000)
      .assert.elementNotPresent('#reason-select') // reason doesn't apply here
      .assert.cssClassNotPresent('#submit-state-change-button', 'disabled') // should be able to submit w/o a comment
      .setValue('#state-change-comment', 'Back to the drawing board') // make sure the comment gets posted
      .click('#submit-state-change-button')
      .pause(1000) // wait for everything to come up

      // Test that everything posted correctly:
      .assert.elementNotPresent('#workflow-transition-dropdown-button') // should now just be text, author can't do anything if in shop
      .assert.containsText('#workflow-state', 'In the shop') // should display the correct text
      .assert.containsText('#workflow-meta', 'is applying grease') // should now mention the worker working on this
      .assert.elementNotPresent('.resolution-active') // Should be no active solutions
      .assert.elementPresent('#show-all-resolutions') // The button should be there now
      .assert.hidden("#rejected-resolutions") // should not be displayed
      .click('#show-all-resolutions')
      .pause(500) // wait for that to take effect
      .assert.visible('.resolution-rejected')
      .assert.containsText('#rejected-resolutions span.resolution-meta:nth-child(1)', 'proposed the following') // should be labeled
      .assert.containsText('.resolution-rejected', 'Nightwatch') // should contain the text of the rejected resolution

      // Hiding works:
      .click("#hide-all-resolutions")
      .assert.hidden("#rejected-resolutions") // should not be displayed anymore

      // The comment should also have been posted correctly:
      .assert.visible('.comment')
      .assert.containsText('.comment', 'Back to the drawing board')

      // Now logout and log back in as the other user
      .logout()
      .loginOtherUser()
      .navigateToNewestSqueak()

      // Should have options in the mechanic role
      .assert.elementPresent('#workflow-transition-dropdown-button') // this should be a button for the author
      .click('#workflow-transition-dropdown-button')
      .waitForElementVisible(".state-change-option li a[action=declareSqueakSqueaky]", 1000)
      .assert.visible(".state-change-option li a[action=proposeSqueakSolution]") // Should have only two options
      .assert.elementNotPresent(".state-change-option li a[action=declareSqueakGreased]") // Should not be able to close
      .click('.state-change-option li a[action=proposeSqueakSolution]') // Submit another proposal
      .waitForElementVisible('#state-change-modal-form', 1000)
      .assert.elementNotPresent('#reason-select') // reason doesn't apply here
      .setValue('#state-change-comment', 'This time I believe we will pass') 
      .click('#submit-state-change-button')
      .pause(1000) // wait for everything to come up

      // We should see this in the active list
      .assert.visible('.resolution-active')

      // Now logout, log back in, and let's resolve this bad boy:
      .logout()
      .loginTestUser()
      .navigateToNewestSqueak()

      // We've already been in this state so *probably* no need to test all that stuff
      .click("#workflow-transition-dropdown-button")
      .waitForElementVisible(".state-change-option li a[action=declareSqueakGreased]", 1000)
      .click(".state-change-option li a[action=declareSqueakGreased]")
      .waitForElementVisible('#state-change-modal-form', 1000)
      .assert.elementPresent('#reason-select')
      .assert.elementPresent('#reason-select option[value=Withdrawn]') // all options should now be available
      .assert.elementPresent('#reason-select option[value=Unproductive]')
      .assert.elementPresent('#reason-select option[value=Offensive]')
      .assert.elementPresent('#reason-select option[value="Passed inspection"]')

      // Go ahead and select 'Passed inspection'
      .click('#reason-select')
      .click('#reason-select option[value="Passed inspection"]')
      .click('#submit-state-change-button')
      .pause(1000) // wait for stuff to come up I guess...

      .assert.elementNotPresent('#workflow-transition-dropdown-button') // no one should be able to change this now
      .assert.containsText('#workflow-state', 'Greased')
      .assert.containsText('#workflow-meta', 'accepted')

      // All editing functionality should no longer be available:
      .assert.elementNotPresent('#body') // the comment submit form shouldn't be there
      .assert.elementNotPresent('#submit-comment') // nor should the button
      .assert.elementNotPresent('#edit-squeak-button') // Can't edit a closed Squeak
      .assert.cssClassPresent('.vote-button', 'disabled') // Can't vote for a closed Squeak
      .assert.elementNotPresent('#axle-input') // Can't tag a closed Squeak to axles

      // And the solution is now accepted:
      .assert.elementPresent('.resolution-accepted')
      .assert.containsText('.resolution-accepted', 'This time I believe')
      .assert.cssClassPresent('.resolution-accepted span', 'glyphicon-ok') // and it has the little glyph

      // Now check notifications
      .click('#view-activity')
      .waitForElementVisible('.activity-entry', 1000) // wait for stuff to load

      // Expect to see at least activities for resolution, under inspection, your comment
      .assert.containsText('#activity-list div.entry:nth-child(3)', 
            'from \'Under inspection\' to \'Greased\' with reason \'Passed inspection\'')
      .assert.containsText('#activity-list div.entry:nth-child(4)', 
            'from \'In the shop\' to \'Under inspection\' with proposed solution')
      .assert.containsText('#activity-list div.entry:nth-child(4) div.state-change-proposed-solution', 
            'This time I believe')
      .assert.containsText('#activity-list div.entry:nth-child(5)', 'You commented on')

      // Unfortunately, we can't delete this Squeak...
           
      .end();
  }
}