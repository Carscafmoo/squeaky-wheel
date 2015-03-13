/**
 * Definition of Mongo collection and associated functionality for Activities.
 * @author  moore
 */
/**
 * Activities performed by various users on various objects.
 * Schema:
 *   _id: default
 *   type: String; the type of activity (e.g., 'comment')
 *   action: An object containing the subscription and args required to subscribe to view the action triggering the activity.
 *   watched: An object containing the subscription and args required to subscribe to view the thing being watched 
 *   users: [Object] An array of objects in form {userId: String, ack: Boolean} to whom the activity is relevant; ack is true
 *     for those users who have already seen this activity.
 *   created: time at which the action took place
 * @type {Mongo Collection}
 */
Activities = new Mongo.Collection('activities');

/**
 * Publish the Activities for the current user; we take care of whatever data we'll need to display in the router.
 * See https://www.discovermeteor.com/blog/reactive-joins-in-meteor/
 * @author  moore
 */
if (Meteor.isServer) { 
  /**
   * @FIXME There must be a way to make it so that we only return this user and not all users to whom the notification was sent?
   */
  Meteor.publish('notifications', function() { 
    return Activities.find({users: {userId: this.userId, ack: false}}, {fields: {_id: 1, users: 1}}); // this is for the notification badge, really
  });

  Meteor.publish('activities', function(limit) { 
    return Activities.find({'users.userId': this.userId}, {users: -1, sort: {created: -1, _id: 1}, limit: limit});
  });
}
/**
 * Acknowledge an Activity
 * @param  {String} activityId The _id of the Activity to acknowledge
 * @return true on success
 */
ackActivity = function ackActivity(activityId, env) {
  var userId = getCurrentUserId(env);
  check(activityId, String);
  // Unfortunately, it is not straightforward to update a single subdocument within an array, so let's pull it out, change it, 
  // and push it back on; we need to check and make sure the user needs this ack'd, though (or else we just gave them an extra one)
  if (!Activities.find({_id: activityId, 'users.userId': userId}).count()) { throw new Meteor.Error('No such activity to ack!'); }
  
  // Need to figure out how to do this for sure
  Activities.update({_id: activityId}, {$pull: {users: {userId: userId}}});
  Activities.update({_id: activityId}, {$addToSet: {users: {userId: userId, ack: true}}});
  
  return true;
}
/**
 * Create an activity.  Needn't be in a Method because it should never be called to the server from the client
 * @param  {Object} semiActivity The basics of an Activity in format: 
 *                               { 
 *                                 type: String
 *                                 action: Object {subscription: String, args: Object},
 *                                 watched: Object {subscription: String, args: Object},
 *                                 users: [UserIDs]
 *                               }
 * @return {String}              the ID of the newly-created activity
 */
createActivity = function createActivity(semiActivity, env) { 
  var users = semiActivity.users; 
  var userId = getCurrentUserId(env);
  check(semiActivity, { 
    type: String,
    action: Object,
    watched: Object,
    users: [String]
  });

  // Clone the semiActivity object so as not to edit it in-place
  newActivity = JSON.parse(JSON.stringify(semiActivity));

  // Check to make sure all users actually exist:
  if ( newActivity.type !== 'userJoined' && (users.length === 0 || Meteor.users.find({_id: {$in: users}}).count() !== users.length)) { 
    throw new Meteor.Error('Activity must be relevant for some non-zero number of existing users!');
  }

  newActivity.users = _.map(users, function(user) { 
    var ack = (user === userId);
    
    return {userId: user, ack: ack};
  });

  newActivity.created = new Date();

  return Activities.insert(newActivity);
}
/**
 * Meteor methods for dealing with activities
 * @author  moore
 */
Meteor.methods({
  /**
   * Acknowledge a Activity
   * @param  {String} activityId The ID of the Activity to acknowledge
   * @return true on success
   */
  ackActivity: function(activityId) {
    return ackActivity(activityId, this);
  }
});