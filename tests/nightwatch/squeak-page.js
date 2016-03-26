module.exports = {
  'Squeak Page' : function (client) {
    client
      .load()

      // Create the standard test squeak
      .createTestSqueak()

      // create test squeak logs out so log back in...
      .loginTestUser()
      .navigateToNewestSqueak()
      .waitForElementVisible('#squeak-info', 1000)
      .assert.urlContains('/squeak/')

      // Author is signed up to watch this by default:
      .assert.elementPresent('.unwatch-squeak-button')

      // Comment should be hidden
      .assert.hidden('#squeak-comments')
      .assert.containsText('#show-squeak-discussion', 'Show discussion (0)')
      .click('#show-squeak-discussion')
      .pause(500) // wait for stuff to happen
      .assert.visible('#squeak-comments')
      .assert.elementNotPresent('#show-squeak-discussion')
      .assert.elementPresent('#hide-squeak-discussion')
      .assert.containsText('#hide-squeak-discussion', 'Hide')
      .click('#hide-squeak-discussion')
      .pause(500) // wait again
      .assert.hidden('#squeak-comments')
      .assert.elementNotPresent('#hide-squeak-discussion')
      .assert.elementPresent('#show-squeak-discussion')
      .assert.containsText('#show-squeak-discussion', 'Show discussion (0)')
      .click('#show-squeak-discussion')
      
      // Try to comment on Squeak:
      .setValue('#squeak-comment-submit-input', 'Nightwatch is automatically commenting on this Squeak')
      .click('#squeak-submit-comment')
      .waitForElementVisible('div.comment', 1000)
      .assert.containsText('div.comment', 'Nightwatch is automatically commenting on this Squeak')
      .assert.containsText('.squeak-counts', ': 0; : 1')// vote: ; comment: 
      .assert.elementPresent('#squeak-comment-submit-input') // The form is still there
      .assert.elementPresent('#squeak-submit-comment')
      .getText('#hide-squeak-discussion', function(success) { 
            this.assert.equal(new RegExp(/[0-9]+/).test(success.value), false); // some problems with the # showing up there earlier
      })
      
      // Try to tag a Squeak to an Axle:
      .assert.elementPresent('#axle-input')
      .setValue('.bootstrap-tagsinput input', 'Test Axle,')
      .pause(500) // Wait for JS to react to this
      .assert.elementPresent('.bootstrap-tagsinput span')
      .assert.cssClassPresent('.bootstrap-tagsinput span', 'tag')

      // Does autocomplete work?
      .setValue('.bootstrap-tagsinput input', 'Squeaky Wheel') // There is a 'Squeaky Wheel Examples'
      .assert.visible('.typeahead.dropdown-menu li a')
      .assert.containsText('.typeahead.dropdown-menu li a', 'Squeaky Wheel')
      .click('.typeahead.dropdown-menu li a')


      // Give it a sec to register and then make sure it showed up before getting rid of it:
      .waitForElementVisible('.bootstrap-tagsinput span:nth-child(2)', 1000)
      .getText('.bootstrap-tagsinput span:nth-child(2)', function(success) { 
            var txt = success.value;
            if (txt === 'Squeaky Wheel Examples') { 
                  this.click('.bootstrap-tagsinput span:nth-child(2) span[data-role=remove]');
            } else this.getText('.bootstrap-tagsinput span:nth-child(1)', function(success) { // try the other one.  I think it orders depending on _id
                  var txt = success.value;
                  if (txt !== 'Squeaky Wheel Examples') { throw new Exception("Error in the removal of the SWExample tag"); }
                  this.click('.bootstrap-tagsinput span:nth-child(1) span[data-role=remove]');
            });
      })
      .pause(300) // wait for that to go away and let's make sure it's gone
      .assert.elementNotPresent('.bootstrap-tagsinput span:nth-child(2)')

      // There should be a vote button, and it should be disabled for the author
      .assert.elementPresent('button.vote-button')
      .assert.cssClassPresent('button.vote-button', 'disabled')
      .click('button.vote-button')
      .pause(500)
      .assert.containsText('.squeak-counts', '0; : 1') // clicking on the disabled button doesn't trigger the event

      // Logout and log in as the other user...
      .logout()
      
      // had trouble with this element not going away
      .assert.elementNotPresent('.bootstrap-tagsinput')

      // log back in
      .loginOtherUser()
      .navigateToNewestSqueak()
      
      // Then test to make sure the data actually persisted:
      .click('#show-squeak-discussion')
      .assert.containsText('div.comment', 'Nightwatch is automatically commenting on this Squeak')
      .assert.elementPresent('.axle-element')
      .assert.containsText('.axle-element', 'Test Axle')

      // And he can comment on stuff:
      .assert.cssClassPresent('#squeak-submit-comment', 'disabled')
      .setValue('#squeak-comment-submit-input', 'anything')
      .assert.cssClassNotPresent('#squeak-submit-comment', 'disabled') 

      // And he can watch and unwatch:
      .assert.elementNotPresent('.unwatch-squeak-button')
      .click('.watch-squeak-button')
      .assert.elementNotPresent('.watch-squeak-button')
      .click('.unwatch-squeak-button')
      .assert.elementNotPresent('.unwatch-squeak-button')

      // And he can vote for stuff
      .assert.cssClassNotPresent('button.vote-button', 'disabled')

      // And voting for stuff works...
      .click('button.vote-button')
      .pause(500) // wait for vote to register
      .assert.containsText('.squeak-counts', '1; : 1')
      .assert.cssClassPresent('button.vote-button', 'disabled') // should only be able to vote once!
      .click('button.vote-button')
      .pause(500)
      .assert.containsText('.squeak-counts', '1; : 1') // clicking on the disabled button doesn't trigger the event

      // And the non-author doesn't get the option to edit:
      .assert.elementNotPresent('#edit-squeak-button')

      // Test to make sure that axle links work...
      .click('.axle-element a')
      .pause(1000) // wait for page load
      .assert.value('#axle-restriction-input', 'Test Axle')

      // Log back in as author to delete
      .logout()
      .loginTestUser()
      .navigateToNewestSqueak()

      // clean up
      .deleteSqueak()
      
      .end();
  }
}