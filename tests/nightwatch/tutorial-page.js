module.exports = {
  "Tutorial pages" : function (client) {
    client
      .load()
      
      // Should be gettable - toable without logging in:
      .click('#tutorial-footer-link')
      .waitForElementVisible('#tutorial-page', 1000)

      // we should be on the welcome page:
      .assert.elementPresent("#tutorial-welcome-page")

      //logged out it shouldn't say we're glad you joined:
      .assert.containsText('#tutorial-welcome-page', "Let's take a look around.")

      // But logged in, it should
      .loginTestUser()
      .click('#tutorial-footer-link')
      .waitForElementVisible('#tutorial-page', 1000)
      .assert.containsText('#tutorial-welcome-page', "We're glad you joined")

      // Does the "explore on your own link" work?
      .click('#tutorial-welcome-page a')
      .waitForElementVisible('#squeak-list', 1000)

      .logout()
      .click('#tutorial-footer-link')
      .assert.containsText('#tutorial-nav-current', "1 / 10") // this should break if we add anything, and that's probably fine
      .assert.containsText('#tutorial-next-page', 'Squeaks')
      .assert.elementNotPresent('#tutorial-previous-page')

      // ------- Squeak page ----------
      .click('#tutorial-next-page')
      .waitForElementVisible('#squeak-info', 1000)

      // Make sure the various parts of the example show up
      .assert.containsText('#squeak-info h3.welcome', 'Mechanism')
      .assert.elementPresent('span.squeak-edited')
      .assert.containsText('.squeak-axle-list .axle-element:nth-child(1) a', 'Automobiles')
      .assert.elementPresent('#squeak-motions')
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(1) .squeak-motion-title', 'Solution')
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(1) .well', 'series of colored lights')
      .assert.containsText('#squeak-motions .squeak-motion:nth-child(1) .squeak-motion-meta .s-w-author', 'Garrett Morgan')

      // Make sure all the buttons and links are disabled
      .assert.cssClassPresent('.squeak-axle-list .axle-element:nth-child(1) a', 'disabled')
      .assert.cssClassPresent('.vote-button', 'disabled')
      .assert.cssClassPresent('.squeak-motion-discussion-toggle', 'disabled')
      .assert.cssClassPresent('.watch-squeak-button', 'disabled')

      // Go ahead and test the previous button while we're thinking about it
      .click('#tutorial-previous-page')
      .waitForElementVisible('#tutorial-welcome-page', 1000)
      .click('#tutorial-next-page')
      .waitForElementVisible('#squeak-info', 1000)

      // ------- Create Squeak Page --------
      .click('#tutorial-next-page')
      .waitForElementVisible('#tutorial-create-squeak-page', 1000)
      .assert.visible('#create-squeak-page') // should have showed up with the right template

      // make sure everything is disabled
      .assert.attributeEquals('#title', 'disabled', 'true')
      .assert.attributeEquals('#description', 'disabled', 'true')
      .assert.attributeEquals('#re-creation', 'disabled', 'true')
      .assert.attributeEquals('#target', 'disabled', 'true')
      .assert.attributeEquals('#submit-new-squeak', 'disabled', 'true')

      // ------- Search Page --------
      .click('#tutorial-next-page')
      .waitForElementVisible('#tutorial-search-page', 1000)
      .assert.elementPresent('.easy-search')
      .assert.elementPresent('#search-view')
      .assert.value('.easy-search', 'automobiles at intersections')
      .assert.elementPresent('#search-view .squeak-entry:nth-child(4)')
      .assert.containsText('#search-view .squeak-entry:nth-child(4) h3 a', 'Mechanism for')
      .assert.elementNotPresent('#search-view .squeak-entry:nth-child(5)')

      // Everything is disabled
      .assert.attributeEquals('.easy-search', 'disabled', 'true')
      .click('#search-option-dropdown button')
      .assert.visible('#search-option-dropdown .search-option .search-option-checkbox[option=Titles]')
      .assert.attributeEquals('#search-option-dropdown .search-option .search-option-checkbox[option=Titles]', 'disabled', 'true')
      .assert.cssClassPresent('#search-view .squeak-entry:nth-child(4) h3 a', 'disabled')
      .assert.cssClassPresent('.vote-button', 'disabled')
      .assert.cssClassPresent('.watch-squeak-button', 'disabled')

      // ------- Axles --------
      .click('#tutorial-next-page')
      .waitForElementVisible('#tutorial-axle-list-page', 1000)
      .assert.visible('.easy-search')
      .assert.value('.easy-search', 'Automobiles')
      .assert.visible('#axle-list .axle-entry:nth-child(3)')
      .assert.containsText('#axle-list .axle-entry:nth-child(3) h3 a', 'Automobiles')
      .assert.elementNotPresent('#axle-list .axle-entry:nth-child(4)')

      .assert.visible('#squeak-list')
      .assert.value('#axle-restriction-input', 'Automobiles')
      .assert.visible('.squeak-entry:nth-child(3)')
      .assert.containsText('#squeak-list .squeak-entry:nth-child(3) h3 a', 'Mechanism for')
      .assert.elementNotPresent('#squeak-list .squeak-entry:nth-child(4)')

      // Everything is disabled
      .assert.attributeEquals('.easy-search', 'disabled', 'true')
      .click('#sort-axles-dropdown')
      .assert.visible('#view-axle-name')
      .assert.cssClassPresent('#view-axle-name', 'disabled')
      .assert.cssClassPresent('.watch-axle-button', 'disabled')
      .assert.cssClassPresent('#axle-list .axle-entry:nth-child(3) h3 a', 'disabled')

      .click('#which-squeaks-dropdown')
      .assert.visible('#view-my-squeaks')
      .assert.cssClassPresent('#view-my-squeaks', 'disabled')
      .click('#sort-squeaks-dropdown')
      .assert.visible('#view-newest-squeaks')
      .assert.cssClassPresent('#view-newest-squeaks', 'disabled')
      .click('#workflow-restriction-dropdown')
      .assert.visible('#view-squeaky-squeaks')
      .assert.cssClassPresent('#view-squeaky-squeaks', 'disabled')
      .assert.attributeEquals('#axle-restriction-input', 'disabled', 'true')
      .assert.cssClassPresent('#squeak-list .squeak-entry:nth-child(3) h3 a', 'disabled')
      .assert.cssClassPresent('.vote-button', 'disabled')
      .assert.cssClassPresent('.watch-squeak-button', 'disabled')
      
      // ----- Activities -----
      .click('#tutorial-next-page')
      .waitForElementVisible('#tutorial-activity-list-page', 1000)
      .assert.elementPresent('#activity-list')
      .assert.visible('#activity-list .entry:nth-child(3)')
      .assert.visible('#activity-list .entry:nth-child(4)')
      .assert.elementNotPresent('#activity-list .entry:nth-child(5)')
      .assert.cssClassPresent('#activity-list .entry:nth-child(3) .activity-entry', 'activity-un-acknowledged')
      .assert.cssClassNotPresent('#activity-list .entry:nth-child(4) .activity-entry', 'activity-un-acknowledged')

      // Stuff what needs disabling is disabled
      .assert.cssClassPresent('#example-watch-button', 'disabled')

      // ---- Workflow states -----
      .click('#tutorial-next-page')
      .waitForElementVisible('#tutorial-squeak-workflow-page', 1000)
      .assert.visible('#squeak-motions')
      .assert.visible('#squeak-motions .squeak-motion-title span.glyphicon-ok')

      // everything is disabled
      .assert.cssClassPresent('.squeak-motion-discussion-toggle', 'disabled')

      // ----- Viscosity Rating -----
      .click('#tutorial-next-page')
      .waitForElementVisible('#tutorial-viscosity-rating-page', 1000)
      .assert.visible('.glyphicon-tint')

      // ----- Discusssion -----
      .click('#tutorial-next-page')
      .waitForElementVisible('#tutorial-comments-page', 1000)
      .assert.visible('#proposal-comment-submit-input')
      .assert.visible('#tutorial-clarification-question-comment .comment')
      .assert.visible('#tutorial-clarification-answer-comment .comment')
      .assert.visible('#tutorial-workflow-request-comment .comment')

      // Everything's disabled:
      .assert.cssClassPresent('#proposal-submit-comment', 'disabled')
      .assert.attributeEquals('#proposal-comment-submit-input', 'disabled', 'true')

      // ---- Last page -----
      .click('#tutorial-next-page')
      .waitForElementVisible('#tutorial-complete-page', 1000)

      .assert.elementNotPresent('#tutorial-next-page')
      .assert.visible('#create-account-link') // logged out, so we should see that.  If we log in and get back here we'd see...

      .loginTestUser()
      .url('http://127.0.0.1:3000/tutorial#9')
      .waitForElementVisible('#tutorial-complete-page', 5000)
      .assert.visible('#get-started-button')

      .end();
  }
}