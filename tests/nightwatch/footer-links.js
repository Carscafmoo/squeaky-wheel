module.exports = {
  'Footer nonsense' : function (client) {
    client
      .load()
      
      // Should be gettable - to able without logging in:
      .click('#contact-footer-link')
      .waitForElementVisible('#contact-page', 1000)
      .assert.elementPresent('#email-address')
      .assert.elementPresent('#website-address')

      .click('#terms-of-use-footer-link')
      .waitForElementVisible('#terms-of-use-page', 1000)
      .assert.containsText('#terms-of-use-page', 'Terms of Use')

      .click('#privacy-policy-footer-link')
      .waitForElementVisible('#privacy-policy-page', 1000)
      .assert.containsText('#privacy-policy-page', 'Privacy Policy')

      .click('#technical-footer-link')
      .waitForElementVisible('#technical-page', 1000)
      .assert.containsText('#technical-framework p:nth-child(2) a:nth-child(1)', 'Meteor')
      .assert.containsText('#technical-deployment p:nth-child(2) a:nth-child(2)', 'demo')
      .assert.containsText('#technical-style p:nth-child(2) a:nth-child(1)', 'Bootstrap')
      .assert.containsText('#technical-style p:nth-child(2) a:nth-child(2)', 'Glyphicons')
      .assert.containsText('#technical-testing p:nth-child(2) a:nth-child(1)', 'Mocha')
      .assert.containsText('#technical-testing p:nth-child(2) a:nth-child(2)', 'Nightwatch')


      .end();
  }
}