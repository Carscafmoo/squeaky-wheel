/**
 * Load the page and wait for an element to be visible
 * @param  {Function} callback 
 * @return object this for chaining.
 * @author  moore
 */
module.exports.command = function(callback) {
  var self = this;
  
  self.url("http://127.0.0.1:3000") 
      .waitForElementVisible("body", 1000)
      
  return this; // allows the command to be chained.
};
