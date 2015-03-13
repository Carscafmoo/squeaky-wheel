module.exports = {
  'Squeak List Views' : function (client) {
    client
      .load()
      .assert.visible('.welcome') // Should display the welcome div as part of the login page

      // Login as non-test user (should be able to see all Squeaks)
      .loginOtherUser()

      // Should see the Squeak list with 10, but no more, Squeaks.
      .waitForElementPresent('#squeak-list', 5000) // Wait for squeak list to show up -- usually on the first run this times out?
      .assert.visible('.squeak-list') // Squeak-list is the expected homepage
      .assert.containsText('h3.welcome', 'Viewing all') // should see all squeaks
      .assert.containsText('h3.welcome', 'sorted by volume') // should be sorted by volume...
      .assert.containsText('h3.welcome', 'in any state') // shouldn't be filtering by resolution
      .assert.value('#axle-restriction-input', '') // shouldn't be filtering by axle yet -- note, this feature is tested in axle-view.js

      // We use N+2 because there are (currently) 2 tags between the .squeak-list and the divs we're counting.
      .assert.elementPresent('#squeak-list div.squeak-entry:nth-child(3)') // Expect to find the first Squeak
      .assert.elementPresent('#squeak-list div.squeak-entry:nth-child(3) .workflow-state')
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(3) .workflow-state', 'Greased') // pretty much everything is
      .assert.elementPresent('#squeak-list div.squeak-entry:nth-child(12)') // Expect to find the 10th Squeak
      .assert.elementNotPresent('#squeak-list div.squeak-entry:nth-child(13)') // Expect not to find the 11th Squeak
      
      // Should be able to load more Squeaks
      .click('.load-more a')
      .waitForElementPresent('#squeak-list div.squeak-entry:nth-child(13)', 5000) // Wait for new stuff to have loaded
      .assert.urlContains('/20')
      .assert.elementPresent('#squeak-list div.squeak-entry:nth-child(3)') // Make sure it didn't get rid of the first Squeak
      
      // Test ordering -- relies on Fixture data :-(
      // First test that the dropdown works and correctly limits choices:
      .click('#sort-squeaks-dropdown')
      .waitForElementVisible('#view-newest-squeaks', 500)
      .assert.elementNotPresent('#view-loudest-squeaks') // shouldn't show this guy since we're already sorting by that
      .click('#view-newest-squeaks')
      .pause(1000) // wait for data to come up
      .click('#sort-squeaks-dropdown')
      .waitForElementVisible('#view-loudest-squeaks', 500) // this should be there now
      .assert.elementNotPresent('#view-newest-squeaks') // and now this guy shouldn't
      .click('#sort-squeaks-dropdown') // close that for now
      .assert.containsText('h3.welcome', 'recency') // should update the text at the top of the page
      
      // Note that we should still have /20 in our URL
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(3) h3', 'Reducing your mother')
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(13) h3', 'Faster production') // These two should be in this order according to fixtures
      
      // vote, and check that it's still in that order
      .click('#squeak-list div.squeak-entry:nth-child(13) .vote-button')
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(13) h3', 'Faster production') // These two should be in this order according to fixtures
      
      // Test loudest Squeak ordering
      .click('#sort-squeaks-dropdown')
      .click('#view-loudest-squeaks') // navigate to loudest
      .pause(1000) // wait for page load I guess
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(3) h3', 'Faster production') // it should have the only votes so it should be at top
      .assert.containsText('h3.welcome', 'volume') // and that re-updated

      // navigate to Squeak page directly to get rid of /20; we can make sure that the publications are refreshing
      // We had a problem where publication was not refreshing and we were just re-ordering local data
      .click('#view-squeaks')
      .pause(1000) // wait for page load I guess

      .assert.containsText('#squeak-list div.squeak-entry:nth-child(3) h3', 'Faster production') // These two should be in this order according to fixtures
      .click('#sort-squeaks-dropdown')
      .click('#view-newest-squeaks')
      .pause(1000) // wait for page load
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(3) h3', 'Reducing your mother') // These two should be in this order according to fixtures
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(12) h3', 'Preventing humans') // This guy wouldn't be here otherwise.
      
      // Test out looking at watched Squeaks:
      .click('#which-squeaks-dropdown')
      .assert.elementNotPresent('#view-all-squeaks') // shouldn't be here since we're already there
      .click('#view-watched-squeaks')
      .pause(1000) // page load
      .assert.containsText('h3.welcome', 'watched')
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(3) h3', 'Reducing your mother')
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(4) h3', 'Make everything better')
      .assert.elementNotPresent('#squeak-list div.squeak-entry:nth-child(5)') // test_user1 is only watching those two according to fixtures

      // Navigate back to the newest Squeak list, watch a Squeak, and come back -- note, we're already sorting by newest
      .click('#which-squeaks-dropdown')
      .assert.elementPresent('#view-all-squeaks') // he should be there now
      .assert.elementNotPresent('#view-watched-squeaks') // now this d00d shouldn't be there
      
      // Test out looking at 'my' Squeaks
      .click('#view-my-squeaks') // navigate to my squeaks and test that only the one shows up
      .pause(1000) // wait for page load I guess...
      .assert.containsText('h3.welcome', 'my')
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(3) h3', 'Reducing your mother')
      .assert.elementNotPresent('#squeak-list div.squeak-entry:nth-child(4)') // test_user1 is only watching the Squeak she created

      // logout and back in as test user, who should have Squeaks.
      .logout()
      .loginTestUser()

      .waitForElementVisible('#squeak-list', 3000)
      .assert.elementPresent('#squeak-list div.squeak-entry:nth-child(3)') // Make sure it didn't get rid of the first Squeak

      // Finally, test out the squeak state by creating a test squeak and walking it through the paces:
      .logout()
      .createTestSqueak()
      .loginTestUser()

      // Make sure we cleared our session variables...
      .pause(1000) // gah
      .assert.containsText('h3.welcome', 'Viewing all') // should see all squeaks
      .assert.containsText('h3.welcome', 'sorted by volume') // should be sorted by volume...
      .assert.containsText('h3.welcome', 'in any state') // shouldn't be filtering by resolution
      .click('#workflow-restriction-dropdown')
      .assert.elementNotPresent('#view-any-resolution-squeaks') // not necessary since we're already there
      .click('#view-squeaky-squeaks')
      .pause(1000) // wait for page load
      .click('#sort-squeaks-dropdown') // make sure we're sorting by recency
      .click('#view-newest-squeaks')
      .pause(1000) // wait for page load
      
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(3) h3', 'Nightwatch Test')
      .click('#squeak-list div.squeak-entry:nth-child(3) h3 a')
      .waitForElementPresent('#squeak-info', 1000)

      // Now go to that Squeak, change his workflow to proposed, and come back:
      .click('#propose-workflow-motion')
      .waitForElementVisible('#squeak-motion-modal-form', 1000)
      .setValue('#squeak-motion-comment', 'test')
      .click('#submit-squeak-motion-button')
      .click('#view-squeaks')
      .assert.elementNotPresent('#squeak-list div.squeak-entry:nth-child(3)') // no Squeaks in that state
      
      .click('#workflow-restriction-dropdown')
      .assert.elementNotPresent('#view-squeaky-squeaks') // you get the picture
      .click('#view-inspection-squeaks')
      .waitForElementVisible('.squeak-content', 1000) // page load

      .assert.elementPresent('#squeak-list div.squeak-entry:nth-child(3)')
      .assert.elementNotPresent('#squeak-list div.squeak-entry:nth-child(4)') // shouldn't be thurr

      // Let's get rid of this guy; we have fixture data in other states.
      .click('#squeak-list div.squeak-entry:nth-child(3) h3 a')
      .waitForElementVisible('#squeak-info', 3000)
      .deleteSqueak()
      .click('#view-squeaks')
      .assert.elementNotPresent('#squeak-list div.squeak-entry:nth-child(3)') // no more Squeaks in that state

      .click('#workflow-restriction-dropdown')
      .assert.elementNotPresent('#view-inspection-squeaks') // you get the picture
      .click('#view-greased-squeaks')
      .waitForElementVisible('.squeak-content', 1000) // page load

      .assert.elementPresent('#squeak-list div.squeak-entry:nth-child(3)')
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(3)', 'Transistor')

      .click('#workflow-restriction-dropdown')
      .assert.elementNotPresent('#view-greased-squeaks') // you get the picture
      .click('#view-rejected-squeaks')
      .pause(1000) // wait for page load

      .assert.elementPresent('#squeak-list div.squeak-entry:nth-child(3)')
      .assert.elementPresent('#squeak-list div.squeak-entry:nth-child(5)') // there should only be three
      .assert.elementNotPresent('#squeak-list div.squeak-entry:nth-child(6)') // there should only be three
      .assert.containsText('#squeak-list div.squeak-entry:nth-child(3) h3', 'Reducing your mother')

      .end();
  }
};