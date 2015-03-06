module.exports = {
  'Random Page' : function (client) {
    client
      .load()
      .loginTestUser()
      .click('#view-random')
      .waitForElementVisible('#squeak-info', 3000)
      .assert.urlContains('/squeak/')

      .click('.unwatch-squeak-button')
      .click('.watch-squeak-button') // this should work if there's no issues
    
      .getText('h3.welcome', function(result) { 
        client
          .refresh() // reload the page
          .pause(3000) // wait for data
          .assert.containsText('h3.welcome', result.value) // make sure the text hasn't chnaged
      })
    
      .end();
  }
}