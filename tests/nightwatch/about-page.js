module.exports = {
  'About page' : function (client) {
    client
      .load()
      
      // Should be gettable - to able without logging in:
      .click('#about-footer-link')
      .waitForElementVisible('#about-page', 1000)

      // There should be three buttons:
      .click('.learn-more-button[route=lifeCyclePage]')
      .waitForElementVisible('#life-cycle-page', 1000)
      .click('#about-page-back-link')
      .waitForElementVisible('#about-page', 1000)      

      .click('.learn-more-button[route=rolesPage]')
      .waitForElementVisible('#roles-page', 1000)
      .click('#about-page-back-link')
      .waitForElementVisible('#about-page', 1000)      

      .click('.learn-more-button[route=missionPage]')
      .waitForElementVisible('#mission-page', 1000)
      .click('#about-page-back-link')
      .waitForElementVisible('#about-page', 1000)      

      // I guess just make sure it still works when logged in
      .loginTestUser()
      .click('#about-footer-link')
      .waitForElementVisible('#about-page', 1000)

      .end();
  }
}