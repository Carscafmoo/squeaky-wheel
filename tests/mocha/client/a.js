/**
 * This file defines global variables and functions useful in client-side testing of all (or > 1) modules.
 * It is called "a.js" because it must be loaded first, and therefore must come alphabetically prior to all other testing scripts. 
 *
 * Code specific to a single module should go in that module's testing script.
 * For more information on client-side testing, see http://squeakywheel.wikidot.com/procedures:code-testing
 * NOTE: Update http://squeakywheel.wikidot.com/procedures:code-testing with any further functionality.
 * @author  moore
 *
 * Note the use of blah = function() rather than function blah() -- this is necessary to get the functions exported globally as variables.
 *
 * The format of this code is to declare variable definitions first, then functions.  Each variable and function
 *   will be listed in alphabetical order and be doc-block'd.
 */
/**
 * Set this variable to false in order to skip axle module testing (axle.js)
 * @type {Boolean}
 */
blnTestAxles = true;
/**
 * Set this variable to false in order to skip notification module testing (notification.js)
 * @type {Boolean}
 */
blnTestNotifications = true;
/**
 * Set this variable to false in order to skip Squeak module testing (squeak.js)
 * @type {Boolean}
 */
blnTestSqueaks = true;
/**
 * Set this variable to false in order to skip user module testing (user.js)
 * @type {Boolean}
 */
blnTestUsers = true;
/**
 * Chai expect
 * @type Function
 */
expect = chai.expect;
/**
 * Password of other user
 * @type {String}
 */
otherPass = 'test456';
/**
 * Name of a user who is not the test user (used for, e.g., "logged in use is not author")
 * @type {String}
 */
otherUser = 'test_user1';
/**
 * Chai should
 * @type Object...?
 */
should = chai.should();
/**
 * Standard test Axle to tag Squeaks to
 * @type {String}
 */
testAxle = "Rose"; // har har
/**
 * Description of a standard Test Squeak
 * @type {String}
 */
testDescription = "Test Description";
/**
 * The password of the test user
 * @type {String}
 */
testPass = 'test123';
/**
 * Title of a standard test Squeak
 * @type {String}
 */
testTitle = "Test Squeak";
/**
 * Standard test Squeak -- note that this has to come after testTitle (sorry, alphabet)
 * @type {Object}
 */
testSqueak = {title: testTitle, 
  description: testDescription, 
  reCreation: "Cannot be recreated",
  target: "All you kids out therein radioland"
};  
/**
 * The name of the test user
 * @type {String}
 */
testUser = 'test_user';

/**
 * So beginneth the functions
 */

/**
 * Function allows for asynchronous assertions used in callbacks.
 * @param  {Function}   assertion A chai assertion or group of Chai assertions, e.g,: function() { whatever.should.do.something(); })
 * @param   the done callback done      Used if the assertion throws an error, otherwise ignored.
 * @return void
 */
callbackAssertion = function callbackAssertion(assertion, done) {
  try { 
    assertion(); 
  } catch (error) { 
    done(error); 

    throw error; 
  }
}
/**
 * Confirm that the user is logged out and that the Test Squeak does not exist and that the test Axle does not exist.
 * @return true on success
 * @throws if the test Axle or the test Squeak exist, or any user is logged in.
 */
confirmBlankSlate = function confirmBlankSlate() { 
  if (Meteor.userId()) { throw new Meteor.Error("Expected to be logged out!"); }
  if (findTestSqueak()) { console.log(findTestSqueak()); throw new Meteor.Error("Expected test Squeak not to exist!"); }
  if (findTestAxle()) { throw new Meteor.Error("Expected test Axle to not exist!"); }
  
  return true;
}
/**
 * Create the standard Test Squeak
 * @param  {Function} callback Function to perform upon creation
 * @return void
 * Assumes Test User is logged in and Test Squeak does not exist (or will throw Exception)
 */
createTestSqueak = function createTestSqueak(callback) { 
  Meteor.call('insertSqueak', testSqueak, callback);
}
/**
 * Find the test Axle and return it
 * @return Axle
 * Assumes any logged-in user and that the testAxle exists
 */
findTestAxle = function findTestAxle() { 
  return Axles.findOne({name: testAxle});
}
/**
 * Find the Test Squeak
 * @return Squeak the standard Test Squeak, if it exists
 * Assumes any logged-in user
 */
findTestSqueak = function findTestSqueak() { 
  return Squeaks.findOne({title: testTitle});
}
/**
 * Delete the Test Axle
 * @param {Function} callback Action to perform upon deletion
 * @return void
 * Assumes logged in user and that no Squeaks are tagged to this Axle
 */
killTestAxle = function killTestAxle(callback) {
  Meteor.call('deleteAxle', testAxle, callback);
}
/**
 * Delete the standard Test Squeak
 * @param  {Function} callback Action to perform upon deletion
 * @return void
 * Assumes Test User is logged in and Test Squeak exists (or will throw Exception)
 */
killTestSqueak = function killTestSqueak(callback) {
  Meteor.call('deleteSqueak', pullTestSqueakId(), callback);
}
/**
 * Login as the non-Test user
 * @param  {Function} callback Action to perform upon login
 * @return void
 * Assumes no user is logged in.
 */
loginOtherUser = function loginOtherUser(callback) {
  Meteor.loginWithPassword(otherUser, otherPass, callback);
}
/**
 * Login as the test user
 * @param  {Function} callback action to perform upon login
 * @return void
 * Assumes no user is logged in
 */
loginTestUser = function loginTestUser(callback) { 
  Meteor.loginWithPassword(testUser, testPass, callback);
}
/**
 * Logout the current user
 * @param  {Function} callback Function to perform upon logout
 * @return void
 * Assumes a user is logged in.
 */
logout = function logout(callback) {
  Meteor.logout(callback);
}
/**
 * Find the Test Squeak's ID
 * @return String the ID of the standard Test Squeak, if it exists
 * Assumes any logged-in user.
 */
pullTestSqueakId = function pullTestSqueakId() {
  return findTestSqueak()._id;
}
/**
 * Tag the test Squeak to the Test Axle
 * @param  {Function} callback The callback to do on completion.
 * @return void
 * Assumes user is logged in as Test User and that Test Squeak exists
 */
tagTestSqueak = function tagTestSqueak(callback) { 
  Meteor.call("tagSqueakToAxle", pullTestSqueakId(), testAxle, callback);
}
/**
 * Remove the test squeak from the test Axle
 * @param  {Function} callback 
 * @return void
 * Assumes user is logged in as test user and test squeak is tagged to test axle.
 */
untagTestSqueak = function untagTestSqueak(callback) { 
  Meteor.call("removeSqueakFromAxle", pullTestSqueakId(), testAxle, callback);
}
