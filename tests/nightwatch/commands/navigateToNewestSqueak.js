/**
 * Navigates to the most recent Squeak.  Assumes any user is logged in.
 * @return {Object} this for chaining.
 * @author  moore
 */
module.exports.command = function(callback) {
  var self = this;
  
  self.click('#view-squeaks') // go to the Squeak list
      .click('#sort-squeaks-dropdown')
      .click('#view-newest-squeaks')
      .pause(500) // wait for results to come back
      .click('#squeak-list div.squeak-entry:nth-child(3) h3 a') // This will be the newest Squeak
      .waitForElementPresent('#squeak-info', 1000); // Wait for the squeak to show up 
  
  return this; // allows the command to be chained.
};
