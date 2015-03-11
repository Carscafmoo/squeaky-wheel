/**
 * To reset:
 * db.users.update({username: 'wd_0'}, {$set: {viscosityEvents: [], viscosityAdmin: false}})
 * db.activities.remove()
 * db.squeaks.remove({title: {$regex: 'Nightwatch Test.*'}});
 * 
 */
module.exports = {
  'Squeak Workflow' : function (client) {
    client
      .load()
      .createTestSqueak()
      
      // --------- Proposing ---------
      .loginViscosityUser('low')
      .navigateToNewestSqueak()

      //  Test that status proposals show up as none
      .assert.containsText('#lack-of-squeak-motions', 'None')
      .assert.elementNotPresent('#squeak-motions')
      
      // Test that anyone regardless of viscosity can propose a solution
      .assert.containsText('#propose-workflow-motion', 'Propose New Status')
      .click('#propose-workflow-motion')
      .waitForElementPresent('#squeak-motion-modal-select', 1000)
      .assert.elementPresent('#squeak-motion-modal-select option[value=Greased]')
      .assert.elementNotPresent('#squeak-motion-modal-select option[value=Withdrawn]')

      // Test that the submit button is disabled and enabled appropriately on the propose new status form
      .assert.cssClassPresent('#submit-squeak-motion-button', 'disabled')
      .setValue('#squeak-motion-comment', 'test')
      .assert.cssClassNotPresent('#submit-squeak-motion-button', 'disabled')
      .clearValue('#squeak-motion-comment')
      .keys(client.Keys.ENTER) // hits enter
      .assert.cssClassPresent('#submit-squeak-motion-button', 'disabled')

      .setValue('#squeak-motion-comment', 'Test resolution')
      .click('#submit-squeak-motion-button')
      .waitForElementPresent("#squeak-motions .squeak-motion:nth-child(1)", 1000)
      .pause(300) // sometimes we hit a snag here
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(1) .squeak-motion-resolution-meta h3', 'Solution')
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(1) .squeak-motion.well', 'Test resolution')

      // Test that only one solution can be proposed at a time
      .assert.elementNotPresent('#propose-workflow-motion')

      // Test that only the author can withdraw
      .assert.elementPresent('#squeak-motions .squeak-motion:nth-child(1) .reject-motion-button') 
      
      .logout()
      .loginViscosityUser('med')
      .navigateToNewestSqueak()
      .assert.elementNotPresent('#squeak-motions .squeak-motion:nth-child(1) .reject-motion-button')

      // Test that an appropriate user can reject as "X"
      .assert.elementPresent('#propose-workflow-motion')
      .click('#propose-workflow-motion')
      .waitForElementPresent('#squeak-motion-modal-select', 1000)
      .assert.elementNotPresent('#squeak-motion-modal-select option[value=Greased]')
      .assert.elementNotPresent('#squeak-motion-modal-select option[value=Withdrawn]')
      .assert.elementPresent('#squeak-motion-modal-select option[value=Offensive]')
      .assert.elementPresent('#squeak-motion-modal-select option[value=Unproductive]')
      .assert.elementPresent('#squeak-motion-modal-select option[value=Duplicate]')

      // Test that only one rejection proposal can exist at a time
      .setValue('#squeak-motion-comment', 'Test rejection')
      .click('#squeak-motion-modal-select')
      .click('#squeak-motion-modal-select option[value=Duplicate]')
      .click('#submit-squeak-motion-button')
      .waitForElementPresent('#squeak-motions .squeak-motion:nth-child(2)', 1000)

      // Test that proposals are displayed as appropriate, with author, timestamp, and comment, in the right order
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(1) .squeak-motion-resolution-meta h3', 'Solution') // these should not have changed
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(1) .squeak-motion.well', 'Test resolution')
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(2) .squeak-motion-resolution-meta h3', 'duplicate')// these should have been added
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(2) .squeak-motion.well', 'Test rejection')

      // And we shouldn't yet have the "show history" button:
      .assert.elementNotPresent('#show-all-motions')

      // ----------- Discussion ----------
      // Test that it shows the discussion points
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(1) .squeak-motion-discussion-toggle', '(0)')
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(2) .squeak-motion-discussion-toggle', '(0)')

      // Test that the discussion modal pops up with the correct title, etc.
      .click('#squeak-motions .squeak-motion:nth-child(1) .squeak-motion-discussion-toggle')
      .waitForElementVisible('#squeak-motion-discussion-modal', 2000)
      .assert.elementPresent('#proposal-comment-submit-input') // we should be able to comment
      .assert.containsText('#squeak-motion-discussion-title', 'Solution from')

      // Test that comments post and the discussion stays on the screen
      .setValue('#proposal-comment-submit-input', 'Test comment on solution')
      .click('#proposal-submit-comment')
      .waitForElementPresent('.modal-body .comment-text:nth-child(1)', 1000)
      .assert.containsText('.modal-body .comment-text:nth-child(1)', 'Test comment on solution')
      .click('.modal-header .close')
      .pause(300) // gah

      // Test that it works even if two separate proposals are open
      .click('#squeak-motions .squeak-motion:nth-child(2) .squeak-motion-discussion-toggle')
      .waitForElementVisible('#squeak-motion-discussion-modal', 2000)
      .assert.elementPresent('#proposal-comment-submit-input') // we should be able to comment
      .assert.containsText('#squeak-motion-discussion-title', 'Proposal to close as duplicate')
      .assert.elementNotPresent('.modal-body .comment-text:nth-child(1)') // this shouldn't be here -- we haven't commented on this propo
      .setValue('#proposal-comment-submit-input', 'Test comment on rejection')
      .click('#proposal-submit-comment')
      .waitForElementPresent('.modal-body .comment-text:nth-child(1)', 1000)
      .assert.containsText('.modal-body .comment-text:nth-child(1)', 'Test comment on rejection')
      .click('.modal-header .close')
      .pause(300) // gah

      // Test that all users can comment
      .logout()
      .loginViscosityUser('low')
      .navigateToNewestSqueak()
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(1) .squeak-motion-discussion-toggle', '(1)')
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(2) .squeak-motion-discussion-toggle', '(1)')
      .click('#squeak-motions .squeak-motion:nth-child(2) .squeak-motion-discussion-toggle')
      .pause(300) // gah
      .waitForElementVisible('#squeak-motion-discussion-modal', 2000)
      .assert.elementPresent('#proposal-comment-submit-input') // we should be able to comment
      .assert.elementPresent('.modal-body .comment-text:nth-child(1)') // now we've done it
      .setValue('#proposal-comment-submit-input', 'Test comment on rejection part 2')
      .click('#proposal-submit-comment')
      .click('.modal-header .close')
      .pause(1000) // wait for everything to take hold I guess
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(1) .squeak-motion-discussion-toggle', '(1)')
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(2) .squeak-motion-discussion-toggle', '(2)') // updates the right one
      

      // ---------- Voting and Resolution --------
      // Test that the voting icon shows for everyone and displays the vote score
      // For low V user, it should be there for two but not for one.
      .assert.elementPresent('#squeak-motions .squeak-motion:nth-child(2) .downvote-motion-button')
      .assert.elementPresent('#squeak-motions .squeak-motion:nth-child(2) .upvote-motion-button')
      .assert.elementNotPresent('#squeak-motions .squeak-motion:nth-child(1) .downvote-motion-button')
      .assert.elementNotPresent('#squeak-motions .squeak-motion:nth-child(1) .upvote-motion-button')
      .getText('#squeak-motions .squeak-motion:nth-child(2) .downvote-motion-button', function(result) { 
            this.assert.equal(new RegExp(/-[0-9]+/).test(result.value), true);
      })
      .getText('#squeak-motions .squeak-motion:nth-child(2) .upvote-motion-button', function(result) { 
            this.assert.equal(new RegExp(/\+[0-9]+/).test(result.value), true);
      })
      
      // Test that the accept / reject proposal button show up for ...
            // Rejection for resolution proposer for the resolution but not for the proposal to reject:
            .assert.elementPresent('#squeak-motions .squeak-motion:nth-child(1) .reject-motion-button')
            .assert.elementNotPresent('#squeak-motions .squeak-motion:nth-child(1) .accept-motion-button')
            .assert.elementNotPresent('#squeak-motions .squeak-motion:nth-child(2) .reject-motion-button')
            .assert.elementNotPresent('#squeak-motions .squeak-motion:nth-child(2) .accept-motion-button')


            // Squeak author for the proposal to resolve, but not proposal to Reject
            .logout()
            .loginTestUser()
            .navigateToNewestSqueak()
            .assert.elementPresent('#squeak-motions .squeak-motion:nth-child(1) .reject-motion-button')
            .assert.elementPresent('#squeak-motions .squeak-motion:nth-child(1) .accept-motion-button')
            .assert.elementNotPresent('#squeak-motions .squeak-motion:nth-child(2) .reject-motion-button')
            .assert.elementNotPresent('#squeak-motions .squeak-motion:nth-child(2) .accept-motion-button')
            
            // rejection author for proposal to reject, but not proposal to resolve
            .logout()
            .loginViscosityUser('med')
            .navigateToNewestSqueak()
            .assert.elementNotPresent('#squeak-motions .squeak-motion:nth-child(1) .reject-motion-button')
            .assert.elementNotPresent('#squeak-motions .squeak-motion:nth-child(1) .accept-motion-button')
            .assert.elementPresent('#squeak-motions .squeak-motion:nth-child(2) .reject-motion-button')
            .assert.elementNotPresent('#squeak-motions .squeak-motion:nth-child(2) .accept-motion-button')
      
      // Test that the reject proposal button works for author of proposal to reject and successfully closes resolution
      .click('#squeak-motions .squeak-motion:nth-child(2) .reject-motion-button')
      .waitForElementVisible('#show-all-motions', 1000) // wait for stuff to take effect
      .assert.elementPresent('#rejected-motions .squeak-motion:nth-child(1)')
      .assert.hidden('#rejected-motions .squeak-motion:nth-child(1)')

      // Test that rejected motions can be shown and hidden
      .click('#show-all-motions')
      .waitForElementVisible('#rejected-motions', 1000)
      .assert.elementPresent('#rejected-motions .squeak-motion:nth-child(1)')
      .assert.containsText('#rejected-motions .squeak-motion:nth-child(1) .squeak-motion-title', 'Proposal to close as duplicate')
      .assert.elementPresent('#rejected-motions .squeak-motion:nth-child(1) .squeak-motion-title .glyphicon-remove')

      // Test that the rejected resolution can no longer be comented on
      .click('#rejected-motions .squeak-motion:nth-child(1) .squeak-motion-discussion-toggle')
      .waitForElementVisible('#squeak-motion-discussion-modal', 2000)
      .assert.elementNotPresent('#proposal-comment-submit-input') // we should not be able to comment
      
      // Test that the "Accept" button works for the Squeak author
      .logout()
      .loginTestUser()
      .navigateToNewestSqueak()
      .assert.elementPresent('#edit-squeak-button')
      .click('#squeak-motions .squeak-motion:nth-child(1) .accept-motion-button')
      .waitForElementPresent('#squeak-motions .squeak-motion:nth-child(1) .squeak-motion-title .glyphicon-ok', 1000)
      .assert.elementNotPresent('#edit-squeak-button') // Shouldn't be able to edit something that's not open.

      // Test that a Squeak can be re-opened (probably by a God user)
      .logout()
      .loginViscosityUser('high')
      .navigateToNewestSqueak()
      .assert.elementPresent('#propose-workflow-motion')
      .click('#propose-workflow-motion')
      .waitForElementPresent('#squeak-motion-modal-select', 1000)
      .assert.elementNotPresent('#squeak-motion-modal-select option[value=Greased]')
      .assert.elementNotPresent('#squeak-motion-modal-select option[value=Withdrawn]')
      .assert.elementPresent('#squeak-motion-modal-select option[value=Squeaky]')

      // Test that the submit button is disabled and enabled appropriately on the propose new status form
      .setValue('#squeak-motion-comment', 'test re-open')
      .click('#submit-squeak-motion-button')
      .pause(1000) // wait for stuff to take effect
      .assert.hidden('#rejected-motions .squeak-motion:nth-child(1)') // should have auto-accepted (rejected-motions is a bad name)
      .click('#show-all-motions')
      .pause(300) // wait to show
      .assert.containsText('#rejected-motions .squeak-motion:nth-child(1) .squeak-motion-title', 'Proposal to re-open')
      .assert.elementPresent('#rejected-motions .squeak-motion:nth-child(1) .squeak-motion-title .glyphicon-ok')
      
      //--------- ACTIVITIES -------------
      .logout()
      .loginTestUser()
      .click('#view-activity')
      .waitForElementPresent('#activity-list .entry:nth-child(3)', 1000)
      
      // Should be an activity for resolved motions
      .assert.containsText('#activity-list .entry:nth-child(3) .activity-label', 'from Greased to Squeaky was accepted') 
      .assert.containsText('#activity-list .entry:nth-child(3) .activity-label', 'Nightwatch Test Squeak')
      .assert.elementPresent('#activity-list .entry:nth-child(3) .squeak-motion')
      .assert.containsText('#activity-list .entry:nth-child(3) .squeak-motion .squeak-motion-title', 'Proposal to re-open')
      
      // Also for new motions
      .assert.elementPresent('#activity-list .entry:nth-child(4)')
      .assert.containsText('#activity-list .entry:nth-child(4) .activity-label', 'from Greased to Squeaky') 
      .assert.containsText('#activity-list .entry:nth-child(4) .activity-label', 'Nightwatch Test Squeak')
      .assert.containsText('#activity-list .entry:nth-child(4) .activity-label', 'proposed change of workflow state')
      .assert.elementPresent('#activity-list .entry:nth-child(4) .squeak-motion')
      .assert.containsText('#activity-list .entry:nth-child(4) .squeak-motion .squeak-motion-title', 'Proposal to re-open')

      // Also for motion comments
      .assert.elementPresent('#activity-list .entry:nth-child(7)')
      .assert.containsText('#activity-list .entry:nth-child(7) .activity-label', 'to Rejected') 
      .assert.containsText('#activity-list .entry:nth-child(7) .activity-label', 'Nightwatch Test Squeak')
      .assert.containsText('#activity-list .entry:nth-child(7) .activity-label', 'commented on')
      .assert.containsText('#activity-list .entry:nth-child(7) .activity-label', 'proposal to change')      
      .assert.elementPresent('#activity-list .entry:nth-child(7) .comment-text')
      .assert.containsText('#activity-list .entry:nth-child(7) .comment-text .comment', 'Test comment')

      // And finally should be able to view -- but not comment on -- discussion:
      .click('#activity-list .entry:nth-child(6) .squeak-motion .squeak-motion-discussion-toggle')
      .waitForElementVisible('#squeak-motion-discussion-modal', 1000)
      .assert.visible('#squeak-motion-discussion-modal .comment-text:nth-child(1)')
      .assert.containsText('#squeak-motion-discussion-modal .comment-text:nth-child(1) .comment', 'Test comment')
      .assert.elementNotPresent('#proposal-comment-submit-input')
      
      // Delete Squeak
      .navigateToNewestSqueak()
      .deleteSqueak()

      .end();
  }
}