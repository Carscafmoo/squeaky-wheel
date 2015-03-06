/**
 * The users collection; users have format...
 *   _id: The ID
 *   name: The user's *real* name (e.g., 'John Smith')
 *   username: The user's username -- unique
 *   email: A single email where the user can be contacted
 *   services: an object containing, among other things, the user's encrypted password
 *   viscosityEvents: [Object] in format... { 
 *       type: String, the type of viscosity event (necessary to cap # per day)
 *       score: Integer, the score contributer to the VR
 *       timestamp: The time at which the score 
 *       decays: Boolean true if the score should decay linearly for 365d since timestamp, false if it's static.
 *     }
 *   viscosityAdmin: Boolean; has the user's VR every been above 100? If so, it cannot fall below unless it goes negative.  
 *     This user can move to close, etc.
 *   
 * @author  moore
 */
if ( Meteor.isServer ) { // Should we split this into two files?
  /**
   * Publish only the user names and IDs of other users given their IDs
   * @param {[String]} ids the IDs to publish
   */
  Meteor.publish('usersById', function(ids) {
    check(ids, [String]);
    return Meteor.users.find({_id: {$in: ids}}, {fields: {name: 1, username: 1}});
  });
  /**
   * Publish all information about the current user
   */
  Meteor.publish('currentUser', function() { 
    return Meteor.users.find({_id: this.userId}); // Return all info about the current user
  });
  /**
   * Publish only the user names, IDs, and VRs of other users associated with a given Squeak
   * @param {String} squeakId the ID of the Squeak whose info to publish
   */
  Meteor.publish('usersBySqueak', function(squeakId) { 
    var squeak = Squeaks.findOne({_id: squeakId});
    var users = [];
    if (squeak) { 
      users.push(squeak.author);
      
      // Loop through any comments and plug the comment authors in:
      _.map(squeak.comments, function(comment) { 
        users.push(comment.author);
      });

      // Ditto resolutions
      _.each(squeak.motions, function(mo) { 
        users.push(mo.user);
        _.each(mo.comments, function(comment) { 
          users.push(comment.author);
        });
      });
    } 
    
    return Meteor.users.find({_id: {$in: _.uniq(users)}});
  });
} else {
  Meteor.subscribe('currentUser');
}
/**
 * Add a viscosity event
 * @param {[String]} users An array containing the IDs of users to add this viscosity event for.
 * @param {String} type The typeof viscosity event to add.  Does not need to be a Meteor Method since it 
 *                               should only be done from the server.  Logic for determining the score from the type is 
 *                               contained within this method.
 * @return {Boolean} true on success
 */
addViscosityEvent = function addViscosityEvent(users, type) { 
  check(users, [String]);
  check(type, String);

  var foundUsers = Meteor.users.find({_id: {$in: users}});
  var timestamp = new Date();

  if (foundUsers.count() !== users.length) { 
    throw new Meteor.Error("Found " + foundUsers.count() + " of requested " + users.length + " users!");
  }
  /**
   * Go through this logic for each user. We could separate the logic for the score vs. the decaying but... eh?
   *   Maybe that actually would see significant performance gains?
   * @todo FIXME separate logic for stuff we need to do on a user-by-user basis (e.g., decay) vs. can do once for everyone (e.g., 
   *       always-decaying events and score amount)
   */
  foundUsers.forEach(function(user) { 
    var event = {type: type};
    var update = {};
    var previousEvents = _.filter(user.viscosityEvents, function(event) { return event.type === type});
    var isFirst = !previousEvents.length; // is this the first time this user has performed this action?
    var isCapped = _.filter(previousEvents, function(event) { 
      return timestamp - event.timestamp < 1000 * 3600 * 24; // same action within the last day 
    }).length >= 5; // Has this user performed this action >= 5x in the last day?
    
    if (type === 'insertSqueak') { // Needs testing
      event.score = isCapped ? 0 : 10; // we submit with a score of 0 to record the user's history no matter what
      event.decay = !isFirst; 
    } else if (type === 'voteForSqueak') { // Needs testing
      event.score = isCapped ? 0 : 1;
      event.decay = true; // these always decay
    } else if ( type === 'commentOnSqueak') { // Needs testing
      event.score = isCapped ? 0 : 3;
      event.decay = !isFirst;
    } else if (type === 'proposeSqueakSolution') { // Needs testing
      event.score = isCapped ? 0 : 10;
      event.decay = !isFirst; 
    } else if (type === 'moveToClose') { // Needs testing
      event.score = isCapped ? 0 : 10;
      event.decay = !isFirst; 
    } else if (type === 'voteOnMotion') { // Needs testing
      event.score = isCapped ? 0 : 5;
      event.decay = true; // these always decay
    } else if (type === 'votedCorrectly') { // Needs testing
      event.score = 10; // we don't cap these
      event.decay = true; // these always decay
    } else if (type === 'votedIncorrectly') { // Needs testing
      event.score = -7;
      event.decay = true; // negative scores always decay
    } else if (type === 'motionPassed') { // Needs testing
      event.score = 25; // we don't cap these
      event.decay = !isFirst; 
    } else if (type === 'motionRejected') { // Needs testing
      event.score = -15;
      event.decay = true; // negative scores always decay
    } else if ( type === 'resolutionPassed') { // Needs testing
      event.score = 50;
      event.decay = !isFirst; // First passed solution never decays
    } else if (type === 'resolutionRejected') { // Needs testing
      event.score = -5;
      event.decay = true; // negative scores always decay
    } else if (type === 'squeakResolved') { // Needs testing
      event.score = 50;
      event.decay = !isFirst;
    } else if (type === 'squeakRejected') { // Needs testing
      event.score = -20;
      event.decay = true; // negative scores always decay
    } else { 
      throw new Meteor.Error("Unknown viscosity event type " + type);
    }

    if (!user.viscosityAdmin) { 
      if (calculateViscosityRating(user) + event.score >= 100) { 
        update.viscosityAdmin = true;
      }
    } else { 
      if (calculateViscosityRating(user) + event.score < 0) { 
        update.viscosityAdmin = false; // You can lose your adminship by falling < 0
      }
    }

    event.timestamp = timestamp;
    Meteor.users.update({_id: user._id}, {$push: {viscosityEvents: event}, $set: update});
  });

  return true;
}
/**
 * Helper function returning the current user ID or erroring if user is not logged in
 * @param {Object} env the calling environment; if a Meteor method, this will allow us to use Meteor.userId() instead of this.userId,
 *                     which may fail if called from the client.
 * @return String
 */
getCurrentUserId = function getCurrentUserId(env) {
  var user;

  if (env) { 
    user = env.userId; 
  } else { 
    user = this.userId; 
  }

  if (!user) { throw new Meteor.Error('User is not logged in!'); }

  return user;
}
/** 
 * Validate a potential password
 * @param  {String} strPass The password in question
 * @return {Boolean}        True if the password conforms to minimum requirements, false otherwise
 */
validatePassword = function validatePassword(strPass) { 
  return (strPass.length >= 7 && !!strPass.match(/[^a-zA-Z]/));
}
/**
 * Return the [real] name of a user given a user ID
 * @param  {String} userId The _id of the user in question
 * @return {String}        That user's name
 */
getUserName = function getUserName(userId) { 
  var user = Meteor.users.findOne({_id: userId});
  return (user ? user.name : ''); // Deals with errors if the data is requested but not yet subscribed to temporarily
}
/**
 * Check if a user exists by ID
 * @param  {String} userId The User Id
 * @return Void
 * @throws {Meteor.Error} If the user does not exist
 */
var userExists = function userExists(userId) { 
  if (!Meteor.users.find({_id: userId}).count()) { throw new Meteor.Error('No such user ' + userId + '!'); }  
}
/**
 * Update a user profile 
 * @param  {String} userId The user ID whose information to update
 * @param  {field} string The field to update (e.g., 'name')
 * @return {value} String The value to update that field to.
 */
updateUserProfile = function updateUserProfile(field, value, env) {
  var user = getCurrentUserId(env);
  var allowableFields;
  var setOpts;
  
  check(field, String);
  check(value, String);
  
  allowableFields = ['name', 'email'];
  if (!_.contains(allowableFields, field)) {
    throw new Meteor.Error('Only ' + allowableFields.join(',') + ' are editable');
  }

  setOpts = {};
  setOpts[field] = value; // have to do this this way due to variable field
  Meteor.users.update({_id: user}, {$set: setOpts});

  return true;
}
/** 
 * Calculate a user's VR
 * @param  {User} user The user in question
 * @return {Integer}      The user's current viscosity rating.
 */
calculateViscosityRating = function calculateViscosityRating(user) { 
  var rating = Math.round(_.reduce(user.viscosityEvents, function(accum, event) {
    var decay_factor = event.decays ? (new Date() - event.timestamp) / 1000 / 3600 / 24 / 365 : 0;
    var contrib = event.score * (1 - (decay_factor > 1 ? 1 : decay_factor));
    
    return accum + contrib;
  }, 0));

  if (user.viscosityAdmin) { rating = rating < 100 && rating >= 0 ? 100 : rating; }

  return rating;
}
/**
 * Methods for interacting with the collection
 * @author  moore
 */
Meteor.methods({
  /**
   * Update a user profile 
   * @param  {String} userId The user ID whose information to update
   * @param  {field} string The field to update (e.g., 'name')
   * @return {value} String The value to update that field to.
   */
  updateUserProfile: function(field, value) {
    return updateUserProfile(field, value, this);
  },
  /**
   * Server-side check for if a user exists
   * @param  {String} user The user to check on
   * @return {Boolean}         true if the passed user exists, false otherwise 
   */
  userNameExists: function userNameExists(user) { 
    return !!Meteor.users.findOne({username: user});
  }
});