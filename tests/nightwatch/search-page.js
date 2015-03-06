module.exports = {
  "Search Page" : function (client) {
    client
      .load()

      // Confirm that the search bar is disabled when we're logged out:
      .assert.attributeEquals('#header-search-input', 'disabled', 'true')
      .assert.cssClassPresent('#submit-header-search', 'disabled')
      
      // Create the test Squeak, we're going to have some fun searching for it
      .createTestSqueak()
      .loginTestUser()
      .assert.cssClassNotPresent('#submit-header-search', 'disabled') // that should re-enable itself when you log in
      .getAttribute('#submit-header-search', 'disabled', function(result) { this.assert.equal(result.value, null); })
      
      // Set up a comment to search for:
      .navigateToNewestSqueak()
      .commentOnSqueak("Aardvark")

      // Now comment on it as the other user so we can search for him:
      .logout()
      .loginOtherUser()
      .navigateToNewestSqueak()
      .commentOnSqueak("Thylacine")

      // Now let's go try to find something:
      .setValue('#header-search-input', "e")
      .submitForm('#header-search-form')
      
      // This should bring up a whole bunch of stuff
      .waitForElementVisible('.easy-search', 1000) // wait for stuff to show up
      .assert.attributeEquals('#header-search-input', 'disabled', 'true') // should disable itself when on the search page
      .assert.cssClassPresent('#submit-header-search', 'disabled') 
      .assert.value('.easy-search', 'e') // Should have automatically redirected our search text from header
      .assert.value('#submit-header-search', '') // Should have cleared the header

      // Should have actually triggered a search; this search should have returned stuff
      .assert.elementPresent('.squeak-content')
      .assert.elementPresent('#search-view div.squeak-entry:nth-child(4)') // Note N + 3 b/c of header
      .assert.elementNotPresent('#search-view div.squeak-entry:nth-child(14)') // Should be paginated
      .assert.elementPresent('.load-more') // should have the button
      .assert.containsText('.load-more', '(11 -') // Should display the next number
      .assert.containsText('.load-more', ' of ') // should display the total

      // Test that pagination is working
      .click('.load-more a')
      .pause(1000) // wait for stuff to load I guess
      .assert.elementPresent('#search-view div.squeak-entry:nth-child(15)') // Should have actually loaded more
      
      // Make sure the "in" dropdown is working...
      .click('#search-option-dropdown button')

      // Everything should be checked 
      .assert.attributeEquals('.search-option-checkbox[option=Titles]', 'checked', 'true')
      .assert.attributeEquals('.search-option-checkbox[option=Descriptions]', 'checked', 'true')
      .assert.attributeEquals('.search-option-checkbox[option=Comments]', 'checked', 'true')
      .assert.attributeEquals('.search-option-checkbox[option=People]', 'checked', 'true')

      .click('#search-option-dropdown button') // make sure it doesn't trigger search unless we've changed anything
      .assert.elementPresent('#search-view div.squeak-entry:nth-child(15)') // Should not have reloaded page

      .click('#search-option-dropdown button')
      .click('.search-option-checkbox[option=Titles]')
      .click('.search-option-checkbox[option=Descriptions]')
      .click('.search-option-checkbox[option=Comments]')
      .click('.search-option-checkbox[option=People]')
      .click('#search-option-dropdown button') // trigger search

      // Should not have triggered a search but should have triggered an error:
      .assert.elementPresent('#search-view div.squeak-entry:nth-child(15)') // Should not have gone away
      .assert.containsText('.input-error-message', 'at least one field')

      .click('#search-option-dropdown button')
      .click('.search-option-checkbox[option=Titles]') // Just looking at Titles

      // Should not trigger search until we exit out of the dropdown menu:
      .assert.elementPresent('#search-view div.squeak-entry:nth-child(15)') // Should not have gone away
      .click('#search-option-dropdown button') // should trigger search

      .pause(1000) // wait for that datums
      
      // pagination resets when we trigger a search
      .assert.elementNotPresent('#search-view div.squeak-entry:nth-child(15)') // Should have gone away
      .assert.elementPresent('.load-more')

      // Change the search query text and see that it triggers a new search:
      .clearValue('.easy-search')
      .setValue('.easy-search', "Aardvark") // No titles with this in them
      .pause(1000) // wait for search
      .assert.elementNotPresent('#search-view div.squeak-entry:nth-child(5)') // Nothing

      .assert.elementPresent('.none-found')
      .assert.containsText('.none-found', 'No results')

      // Now test searching for comments:
      .click('#search-option-dropdown button')
      .click('.search-option-checkbox[option=Titles]')
      .click('.search-option-checkbox[option=Comments]')
      .click('#search-option-dropdown button') // trigger search
      .pause(1000) // wait for search

      .assert.elementPresent('#search-view div.squeak-entry:nth-child(4)') // Should still be there!
      .assert.containsText('#search-view div.squeak-entry:nth-child(4) h3', 'Nightwatch') // and it should be our guy
      .assert.elementNotPresent('#search-view div.squeak-entry:nth-child(5)') // and it should be the only one

      // Now test searching for descriptions
      .click('#search-option-dropdown button')
      .click('.search-option-checkbox[option=Comments]')
      .click('.search-option-checkbox[option=Descriptions]')
      .click('#search-option-dropdown button')
      .assert.elementNotPresent('#search-view div.squeak-entry:nth-child(4)') // Shouldn't show anything

      // Test descriptions:
      .clearValue('.easy-search')
      .setValue('.easy-search', 'created as part of Nightwatch testing')
      .pause(1000) // Wait for data
      .assert.elementPresent('#search-view div.squeak-entry:nth-child(4)') // Should pick up a Nightwatch test squeak there
      .assert.containsText('#search-view div.squeak-entry:nth-child(4) h3', 'Nightwatch')

      // Test reCreations:
      .clearValue('.easy-search')
      .setValue('.easy-search', 'Re-run this test')
      .pause(1000) // Wait for data
      .assert.elementPresent('#search-view div.squeak-entry:nth-child(4)') // Should pick up a Nightwatch test squeak there
      .assert.containsText('#search-view div.squeak-entry:nth-child(4) h3', 'Nightwatch')

      // Test targets:
      .clearValue('.easy-search')
      .setValue('.easy-search', 'The developers of Squeaky Wheel')
      .pause(1000) // Wait for data
      .assert.elementPresent('#search-view div.squeak-entry:nth-child(4)') // Should pick up a Nightwatch test squeak there
      .assert.containsText('#search-view div.squeak-entry:nth-child(4) h3', 'Nightwatch')

      // Now test searching for people
      .click('#search-option-dropdown button')
      .click('.search-option-checkbox[option=Descriptions]')
      .click('.search-option-checkbox[option=People]')
      .click('#search-option-dropdown button') // trigger search
      .clearValue('.easy-search')
      .setValue('.easy-search', 'John Doe')
      .pause(1000) // wait for search
      .assert.containsText('#search-view', 'Nightwatch Test Squeak') // should pick up the one we just made

      // Now navigate away and make sure our search bar is enabled
      .click('#search-view div.squeak-entry:nth-child(4) h3 a')
      .waitForElementVisible('#squeak-info', 1000) // wait for load
      .getAttribute('#header-search-input', 'disabled', function(result) { this.assert.equal(result.value, null); })
      .assert.cssClassNotPresent('#submit-header-search', 'disabled')

      // Navigate back and make sure it held onto our tastes and preferences
      .setValue('#header-search-input', "Test")
      .click('#submit-header-search') // this should submit the form
      .waitForElementVisible('#search-view', 1000) // wait for data

      .getAttribute('.search-option-checkbox[option=Titles]', 'checked', function(result) { this.assert.equal(result.value, null); })
      .getAttribute('.search-option-checkbox[option=Descriptions]', 'checked', function(result) { this.assert.equal(result.value, null); })
      .getAttribute('.search-option-checkbox[option=Comments]', 'checked', function(result) { this.assert.equal(result.value, null); })
      .assert.attributeEquals('.search-option-checkbox[option=People]', 'checked', 'true') // that should be the only one left

      // Now go to the Squeak list view and sort by recent and get rid of that Squeak
      .logout()
      .loginTestUser()
      .navigateToNewestSqueak()
      .deleteSqueak()

      .end();
  }
}
