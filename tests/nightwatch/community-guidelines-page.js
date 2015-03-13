module.exports = {
  'Community Guidelines Page' : function (client) {
    client
      .load()
      
      // The community guidelines page should be accessible if not logged in:
      .assert.visible('#community-guidelines-footer-link')
      .click('#community-guidelines-footer-link')
      .waitForElementPresent('#guidelines-header', 1000)

      // They should also be visible and accessible if you're already logged in
      .click('#header-logo')
      .waitForElementVisible('h1.welcome', 1000)
      .loginTestUser()
      .assert.visible('#community-guidelines-footer-link')
      .click('#community-guidelines-footer-link')
      .waitForElementPresent('#guidelines-header', 1000)

      // The links should work
      .click('#go-to-guidelines-all-times-anchor')
      .pause(500)
      .getLocationInView('#guidelines-before-squeaking-header', function(result) { 
        // Should have scrolled down to exactly this point
        this.assert.equal(result.value.y, 0);
      })

      .end();
  }
};