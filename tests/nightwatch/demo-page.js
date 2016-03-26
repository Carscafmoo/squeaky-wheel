module.exports = {
  'Demo Page' : function (client) {
    client
      .load()
      
      // Should be gettable - to able without logging in:
      .assert.visible('#header-meta-demo')
      .assert.containsText('#header-meta-demo', 'Demo')
      .click('#header-demo-link')
      .waitForElementVisible('#demo-page', 1000)
      .assert.visible('#demo-page-why p:nth-child(2) a:nth-child(1)')
      .assert.attributeEquals('#demo-page-why p:nth-child(2) a:nth-child(1)', 'href', 'http://www.carscafmoo.com/')
      .assert.visible('#demo-page-instability')
      .assert.visible('#demo-page-data-transience')
      .assert.visible('#demo-page-feature-poverty')
      .end();
  }
}