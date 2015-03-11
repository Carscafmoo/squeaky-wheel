/**
 * This file contains the tests for the activity page.  
 *  It expects there to be no activities.  As a result, it may be necessary to clear out the activities from the mongo DB:
 *  db.activities.remove();
 * @type {Object}
 */
module.exports = {
  "Activity Page" : function (client) {
    client
      .load()
      .assert.visible(".welcome") // Should display the welcome div as part of the login page
      .createTestSqueak() // create the test squeak and log back out...

      // Login as non-test user -- we're gonna comment on some Squeaks... 
      .loginOtherUser() // navigate to the most recent Squeak
      .navigateToNewestSqueak()

      .commentOnSqueak('a')
      .commentOnSqueak('b')
      .commentOnSqueak('c')
      .commentOnSqueak('d')
      .commentOnSqueak('e')
      .commentOnSqueak('f')
      .commentOnSqueak('g')
      .commentOnSqueak('h')
      .commentOnSqueak('i')
      .commentOnSqueak('j')
      .commentOnSqueak('k')
      .commentOnSqueak('l')
      .commentOnSqueak('m') // create a bunch of notifications for the test user!

      // Let's also set it up so he's watching the test axle:
      .click('#view-axles') 
      .pause(500) // for some reason...
      .waitForElementVisible('.axle-content', 3000)
      
      .click('#axle-list div.axle-entry:nth-child(3) .watch-axle-button')
      
      .logout() 
      .loginTestUser()

      // Go back to that Squeak and tag it to the axle... then untag it and tag it again (why not):
      .click('#view-squeaks')
      .waitForElementVisible('#squeak-list', 1000)
      .click('#sort-squeaks-dropdown')
      .click('#view-newest-squeaks')
      .pause(1000) // wait for data to load I guess
      .click('#squeak-list div.squeak-entry:nth-child(3) a')
      .setValue('.bootstrap-tagsinput input', 'Squeaky Wheel Examples,') 
      .click('.bootstrap-tagsinput .tag span') // removes the axle from the tag ... or ... should...
      .setValue('.bootstrap-tagsinput input', 'Squeaky Wheel Examples,') // We should see three notifications...
      
      .assert.containsText('#notification-badge', '13')
      .click('#view-activity')
      .waitForElementVisible('#activity-list', 3000)

      // We use N+2 because there are (currently) 2 tags between the .squeak-list and the divs we're counting.
      .assert.elementPresent("#activity-list div.entry:nth-child(3)") // Expect to find the first comment
      .assert.cssClassPresent("#activity-list div.entry:nth-child(3) div.activity-entry", 'activity-un-acknowledged') // should be un-ack'd
      .assert.elementPresent("#activity-list div.entry:nth-child(12)") // Expect to find the 10th comment
      .assert.cssClassPresent("#activity-list div.entry:nth-child(12) div.activity-entry", 'activity-un-acknowledged') // should be un-ack'd
      .assert.elementNotPresent("#activity-list div.entry:nth-child(13)") // Expect not to find the 11th comment
      .assert.containsText("#activity-list div.entry:nth-child(3)", "m") // reverse sort order
      .assert.containsText("#activity-list div.entry:nth-child(12)", "d") // reverse sort order

      // Should be paginated
      .assert.elementPresent('.load-more')
      .click('.load-more a')
      .waitForElementPresent("#activity-list div.entry:nth-child(13)", 5000) // Expect to find the 11th comment now
      .assert.containsText("#activity-list div.entry:nth-child(15)", "a") // reverse sort order
      .assert.cssClassPresent("#activity-list div.entry:nth-child(15) div.activity-entry", 'activity-un-acknowledged') // should be un-ack'd
      .assert.urlContains("/20") // should have loaded more in the URL

      // Moving away from the page resets the un-ack'd activity counter and acks all activities:
      .click('#view-axles')
      .waitForElementPresent('#axle-list', 5000)
      .assert.containsText("#notification-badge", "") // I don't think this is really what we want here...?

      .click('#view-activity')
      .waitForElementVisible('#activity-list', 3000)
      .assert.elementPresent("#activity-list div.entry:nth-child(3)") // Expect to find the first comment
      .assert.cssClassNotPresent("#activity-list div.entry:nth-child(3) div.activity-entry", 'activity-un-acknowledged') // should be ack'd

      // Check to see that axle notifications showed up:
      .logout()
      .loginOtherUser()
      .click('#view-activity')
      .waitForElementVisible('#activity-list', 3000)
      .assert.elementPresent('#activity-list div.entry:nth-child(3)')
      .assert.containsText('#activity-list div.entry:nth-child(3) label', 'John Doe tagged the following squeak to watched axle')
      .assert.elementPresent('#activity-list div.entry:nth-child(4)')
      .assert.containsText('#activity-list div.entry:nth-child(4) label', 'John Doe removed the following squeak from watched axle')

      // Now go delete that Squeak
      .logout()
      .loginTestUser()
      .click('#view-activity')
      .waitForElementVisible('#activity-list', 3000)

      .click("#activity-list div.entry:nth-child(3) .watched-link") // navigate back to Squeak page to delete
      .waitForElementVisible('#squeak-info', 3000)

      .deleteSqueak()

      // move back to the activity page; did this generate an activity?  Did all the other activities go away?
      .click('#view-activity')
      .waitForElementVisible("#activity-list", 3000)
      .assert.containsText('#activity-list div.entry:nth-child(3) label', 'You deleted watched squeak')
      .assert.elementNotPresent('#activity-lst div.entry:nth-child(4)') // deleting the Squeak should clean up all activities
      .logout()

      // log back in as the other user and confirm that you get the alert for your watched axle:
      .loginOtherUser()
      .click('#view-activity')
      .waitForElementVisible('#activity-list', 3000)
      .assert.containsText('#activity-list div.entry:nth-child(3) label', 'John Doe deleted squeak')
      .assert.elementNotPresent('#activity-list div.entry:nth-child(5)') // the other notifications should be gone once it's deleted.

      // navigate back and stop watching that axle...
      .click('#view-axles') // navigate to axle view to unwatch that
      .waitForElementVisible('.axle-content', 3000)
      .click('#axle-list div.axle-entry:nth-child(3) .unwatch-axle-button')
          

    .end();
  }
};