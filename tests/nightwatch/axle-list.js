module.exports = {
  "Axle View" : function (client) {
    client
      .load()
      
      // Create the test Squeak and log in as test user
      .createTestSqueak()
      .loginTestUser()

      // Set up a test axle by navigating to a Squeak and tagging it:
      .navigateToNewestSqueak()
      .waitForElementVisible('#squeak-info', 1000) // wait for page to load
      .setValue('.bootstrap-tagsinput input', 'Nightwatch Test Axle,') // trailing comma registers as a single input
      .pause(500) // wait for that to take effect...
      
      .click("#view-axles")
      .waitForElementVisible("#axle-list", 1000)

      // Should display meaningful info:
      .assert.containsText('h3.welcome', 'sorted by popularity')

      // Pagination and sorting: there should be only 10, defaulting to sorted by popularity
      // Note use of N + 2; there are 2 tags in #axle-list prior to the first .axle-entry div
      .assert.elementPresent("#axle-list div.axle-entry:nth-child(3)") // Expect to find the 1st Axle
      .assert.containsText("#axle-list div.axle-entry:nth-child(4) h3", "Tech") // According to our Fixture data this should be 2nd most pop
      .assert.containsText("#axle-list div.axle-entry:nth-child(7) h3", "Nightwatch Test Axle") // According to our Fixture data our new guy should be 5th
      .assert.elementPresent("#axle-list div.axle-entry:nth-child(12)") // Expect to find the 10th Axle
      .assert.elementNotPresent("#axle-list div.axle-entry:nth-child(13)") // Expect not to find the 11th Axle

      // Now check that the axle list pagination button works:
      .assert.containsText('.load-more', "11 - 16 of 16") // This could fail really hard -- should be 16 but who knows?
      .click(".load-more a")
      .waitForElementPresent("#axle-list div.axle-entry:nth-child(13)", 1000) // Expect him to show up!

      // Test sorting works
      .click("#sort-axles-dropdown")
      .assert.elementNotPresent('#view-popular-axles') // we're already doing that!
      .click('#view-axle-name')
      .pause(1000) // wait for data I guess

      // We shouldn't see our new friend, and pagination should have reset
      .assert.containsText('h3.welcome', 'sorted by name') // header updated
      .assert.containsText("#axle-list div.axle-entry:nth-child(3)", "Arlington VA") // 1st alphabetically in fixture data
      .assert.elementNotPresent("#axle-list div.axle-entry:nth-child(13)") // Expect not to find the 11th Axle
      .click(".load-more a")
      .waitForElementPresent("#axle-list div.axle-entry:nth-child(13)", 1000) // Expect him to show up!

      // Now explicitly go back to popular sorting:
      .click("#sort-axles-dropdown")
      .assert.elementNotPresent('#view-axle-name') // we're already doing that!
      .click('#view-popular-axles')
      .pause(1000) // wait for data I guess

      // And just test again cuz like why not y'know
      .assert.containsText('h3.welcome', 'sorted by popularity') // header updated
      .assert.elementPresent("#axle-list div.axle-entry:nth-child(3)") // Expect to find the 1st Axle
      .assert.containsText("#axle-list div.axle-entry:nth-child(7) h3", "Nightwatch Test Axle") // Expect this new axle to be still be 5th most popular
      .assert.elementPresent("#axle-list div.axle-entry:nth-child(12)") // Expect to find the 10th Axle
      .assert.elementNotPresent("#axle-list div.axle-entry:nth-child(13)") // Expect not to find the 11th Axle

      // Test searching -- once we search, there should only be one thing and it should match our query text
      .setValue('.easy-search', 'Nightwatch')
      .pause(300) // wait for typeahead
      .assert.elementPresent('.typeahead.dropdown-menu li:nth-child(1)') 
      .assert.elementNotPresent('.typeahead.dropdown-menu li:nth-child(2)') // should only match the one Axle
      .click('.typeahead.dropdown-menu li:nth-child(1) a')
      
      .pause(1000) // wait for search I guess
      .assert.elementPresent("#axle-list div.axle-entry:nth-child(3)") // Expect to find the 1st Axle
      .assert.containsText("#axle-list div.axle-entry:nth-child(3) h3", "Nightwatch Test Axle") // Expect this new axle to be only one here
      .assert.elementNotPresent("#axle-list div.axle-entry:nth-child(4)") // Expect not to find anything else

      // Test everything comes back up when you clear the search value:
      .clearValue('.easy-search')
      .click('.easy-search') 
      .keys(client.Keys.ENTER) // hits enter
      .pause(1000) // wait for search I guess
      .assert.elementPresent("#axle-list div.axle-entry:nth-child(3)") // Expect to find the 1st Axle
      .assert.elementPresent("#axle-list div.axle-entry:nth-child(4)") // Expect to find another Axle
      
      // navigate to the axle view squeak list page by clicking on the example axle
      // (which should be at the top, according to the way we've set this up)
      .click("#axle-list div.axle-entry:nth-child(3) a")
      .waitForElementPresent("div.squeak-list", 1000)

      // Test that this page works as expected:
      .assert.value('#axle-restriction-input', 'Squeaky Wheel Examples')
      .assert.elementPresent("div.squeak-list div.squeak-entry:nth-child(3)") // Expect to find the first Squeak
      .assert.elementPresent("div.squeak-list div.squeak-entry:nth-child(12)") // Expect to find the 10th Squeak
      .assert.elementNotPresent("div.squeak-list div.squeak-entry:nth-child(13)") // Expect not to find the 11th Squeak
      
      // Now try restricting to other axles
      .clearValue('#axle-restriction-input')
      .submitForm('#axle-restriction-form')
      .pause(1000) // wait for data I guess
      .assert.elementPresent('div.squeak-list div.squeak-entry:nth-child(12)') // should be showing everything now
      .setValue('#axle-restriction-input', 'Nightwatch Test')
      .pause(300) // wait for typeahead
      .assert.elementPresent('.typeahead.dropdown-menu li:nth-child(1)') 
      .assert.elementNotPresent('.typeahead.dropdown-menu li:nth-child(2)') // should only match the one Axle
      .click('.typeahead.dropdown-menu li:nth-child(1) a')
      
      .pause(1000) // wait for data I guess
      .assert.value('#axle-restriction-input', 'Nightwatch Test Axle')
      .assert.elementPresent('div.squeak-list div.squeak-entry:nth-child(3)') // Should be that one
      .assert.elementNotPresent('div.squeak-list div.squeak-entry:nth-child(4)') // and only that one
            
      // clean up after yourself -- move back to that page and kill that axle!
      .click('div.squeak-list div.squeak-entry:nth-child(3) h3 a') 
      .waitForElementVisible('#squeak-info', 1000) // wait for page to load
      .assert.containsText('.bootstrap-tagsinput .label-info:nth-child(1)', 'Nightwatch') // don't asplode it if it's the wrong one
      .click('.bootstrap-tagsinput .label-info:nth-child(1) span[data-role=remove]') 
      .deleteSqueak()

      .end();
  }
}
