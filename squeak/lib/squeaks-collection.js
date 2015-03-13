/**
 * Squeaks is a mongo collection of Squeaks.
 * @type {Mongo}
 * @author  moore
 * Schema for squeaks is as follows:
 * _id: default
 * title: text field; < 255 characters; unique.
 * description: long text field, describing the problem
 * reCreation: long text field, indicating how the problem was encountered and what can be done to recreate it
 * target: long text field, indicating potential benefitters from a solution
 * author: normalized; ObjectID.
 * state: String, one of ...
 *   'Squeaky' (Open), 
 *   'Under inspection' (A solution has been proposed),
 *   'Greased' (closed -- solution accepted),
 *   'Rejected' (closed -- Squeak itself was bogus)
 * motions: [Object] in form {
 *     _id: A unique ID on the motion proposal.
 *     proposedState: The state that is being proposed (one of 'Squeaky' for re-opening, 'Greased' for resolutions, 
 *       'Rejected' for closed Squeaks)
 *     previousState: the previous state of the Squeak, to resolve ambiguity if this motion is defeated
 *     reason: String, the reason for the change, only valid if proposing to reject Squeak
 *     user: the user proposing the resolution
 *     created: Date of resolution proposal
 *     resolved: the time at which the proposal was resolved, if it has been resolved (null if not)
 *     comment: A comment giving a reason for the motion
 *     state: one of 'Accepted' (the score reached 1000), 'Rejected' (the score reached -1000), or 'Open' -- still in vote stage
 *     score: An integer value indicating the current score
 *     comments: [Object] in form of comments below -- comments specifically on the motion at hand
 *     voters: [Object] Object in form {userId: String User IDs of people who have already voted on the motion, 
 *                                       isFor: Boolean whether they were for (true) or against)}
 *   }
 * createdAt: Date
 * comments (normalized?) // For now, comments will not be normalized: [{_id: ID, author: UserID, comment: String, createdAt: Date}]
 * votes (indexed)
 * voters (normalized)
 * axles: (normalized, indexed)
 * watchers (normalized, indexed)  or do we store that in users? (I'm pretty sure we do that here and in axle for pub/sub ease)
 * @todo
 *   some other stuff, I'm sure
 *   normalize comments?
 *   normalize proposals?
 * @todo  Add indices (do we do this... here)?  I think we do this in the startup.js file.  Add the test in tests/mocha/server/squeaks.js? 
 *        (or wherever)
 * @todo  paginate comments maybe?
 */
Squeaks = new Mongo.Collection('squeaks');
var searchableFields = ['title', 
          'description', 
          'reCreation', 
          'target', 
          'motions.comment', 
          'comments.comment', 
          'motions.comments.comment', 
          'author', 
          'motions.user', 
          'comments.author', 
          'motions.comments.author'];// debug add in axles?
/**
 * Create a search object on Squeaks, index by title, axles, text fields, and comments
 */
var searchOpts = {
  field: searchableFields, 
  collection: Squeaks,
  use: 'mongo-db',
  limit: 10,
  query: function (searchString) {
    // Default query that will be used for searching
    var query = EasySearch.getSearcher(this.use).defaultQuery(this, searchString);
    var userFields = ['author', 'comments.author', 'motions.user', 'motions.comments.author'];
    var otherFields = _.difference(this.props.fields, userFields);
    var newOr;
    
    // Filter out any that aren't in our props var; 
    // Also filter out any that are in the user fields
    newOr = _.filter(query.$or, function(queryObj) { 
      return _.intersection(Object.keys(queryObj), otherFields).length;
    }); 

    // If we're searching for people, we need to change our query to search for people IDs instead
    userFields = _.intersection(userFields, this.props.fields);
    if (userFields.length) { 
      authors = Meteor.users.find({name: {$regex: '.*' + searchString + '.*', $options: 'i'}}).fetch();
      authors = authors.map(function(obj) { return obj._id});
      
      _.each(userFields, function(field) {  // loop through each and add a new 'or' option.
        var subQuery = {} // build up our 'or' statement
        subQuery[field] = {$in: authors};
        newOr.push(subQuery);
      });
    } // end if userFields

    query.$or = newOr;
    
    return query;
  },
  sort: function() { 
    return {title: 1, description: 1, reCreation: 1, target: 1, author: 1, 'motions.comment': 1, 'motions.user': 1, _id: 1};
  },
  /**
   * Used in conjunction w/ `query` to determine what to actually look through
   * @type {Object}
   */
  props: {
    fields: searchableFields
  }
};

EasySearch.createSearchIndex('squeaks', searchOpts);

if ( Meteor.isServer ) { // Should we split this into its own file?
  /**
   * Publish all fields of certain squeaks, used in the Squeak List view
   * @param  {Object} which    object in form {axles: optional String, 
   *                                           author: optional String, 
   *                                           state: optional String, 
   *                                           watchers: optional String}
   * @param  {Object} options) in form {sort: Sort Object, limit: Integer}
   * @return {Mongo.Cursor} 
   */
  Meteor.publish('squeaks', function(which, options) {
    check(which, {
      axles: Match.Optional(String),
      author: Match.Optional(String),
      state: Match.Optional(String),
      watchers: Match.Optional(String)
    }); 

    check(options, {
      sort: Object,
      limit: Number
    });
    
    return Squeaks.find(which, options); // eventually want to limit to only the data we actually want
  });
  /**
   * Publish all fields in a set of Squeaks given an array of squeak IDs
   * @param  {[String]} ids the IDs of the Squeaks to publish
   * @return {Mongo.Cursor}
   */
  Meteor.publish('squeaksByIds', function(ids) { 
    return Squeaks.find({_id: {$in: ids}});
  });
  /**
   * Publish the details of a single Squeak
   * @param {String} [squeakId] The ID of the Squeak to publish
   * @return {Mongo.Cursor}
   */
  Meteor.publish('squeakDetail', function(squeakId) {
    check(squeakId, String);

    return Squeaks.find({_id: squeakId});
  });
  /**
   * Publish Squeaks given comment IDs attached to that Squeak
   * @param  {[String]} commentIds An array of comment _ids 
   * @return {Mongo.Cursor}                 [description]
   */
  Meteor.publish('squeakComments', function(commentIds) { 
    check(commentIds, [String]);
    return Squeaks.find({'comments._id': {$in: commentIds}}, {fields: {comments: 1, author: 1, title: 1}});
  });
  /**
   * Publish the example Squeak for use in the tutorial / tour
   * @return {Mongo.Cursor}
   */
  Meteor.publish('exampleSqueak', function() { 
    return Squeaks.find({title: 'Mechanism for regulating the flow of automobiles at intersections'});
  })
}
/**
 * Pseudo-private method for determining if a Squeak is actually open.
 * Throw an error if the Squeak has already been closed and you're trying to edit it, among other things
 * @param  {Squeak} squeak The Squeak in question
 * @return {Boolean}        true if the Squeak is not greased
 * @throws {Meteor.Error} If the Squeak has already been greased and is therefore not eligible for modification.
 */
var confirmOpen = function confirmOpen(squeak) { 
  if (squeak.state === 'Greased') { 
    throw new Meteor.Error('Cannot perform any operations on greased Squeaks!');
  }

  return true;
}
/**
 * Psuedo-private Helper function for finding indices in an array to replace _.findIndex, which is experimental
 *   Finds the first instance in the passed array for which the predicate function returns true
 * @param {Array} array the array in which to find the index of the predicate
 * @param {Function} predicate a function on the elements of the array returning a Boolean value.
 * @return {Integer} The first index of the array for which the predicate returns true, or -1 if none does.
 */
var findIndex = function findIndex(array, predicate) { 
  var retIndex = -1;
  var index = 0;
  while(index < array.length) { 
    if (predicate(array[index], index)) { 
      retIndex = index;
      break;
    }

    index ++;
  }

  return retIndex;
}
/**
 * Pseudo-private helper for determining whether a Squeak title exists or not
 * @param  {String} title the title of the Squeak in question
 * @return {Boolean}       True if the title already exists, false otherwise
 */
var squeakTitleExists = function squeakTitleExists(title) { 
  return !!Squeaks.findOne({title: title});
}

/**
 * Methods below will only work when called from the server (the client is restricted from inserting into the Squeak collection).
 *   The logic is separated from the Meteor Methods because the MM's can only be called from the client, while these may be called from
 *   the server (e.g., by the MM or in testing).
 */
/**
 * Comment on a workflow motion
 * @param {String} motionId The _id of the motion in question
 * @param {String} comment the comment to add to the motion
 */
commentOnMotion = function commentOnMotion(motionId, comment, env) { 
  check(motionId, String);
  check(comment, String);
  var squeak = Squeaks.findOne({'motions._id': motionId});
  var user = getCurrentUserId(env);
  var push = {};
  var motion; 
  var motionIndex;
  var commentToPush;
  

  if (!squeak) { throw new Meteor.Error('No Squeak found with given motion ID'); }
  
  comment = comment.trim();
  if (!comment) { throw new Meteor.Error('Comment cannot be empty!'); }

  motionIndex = findIndex(squeak.motions, function(mo) { return mo._id === motionId; });
  motion = squeak.motions[motionIndex];
  if (motion.state !== 'Open') { throw new Meteor.Error('Cannot comment on resolved motion!'); }
  
  commentToPush = {_id: new Mongo.Collection.ObjectID().valueOf(), 
                  author: user, 
                  comment: comment, 
                  createdAt: new Date()
                }

  push['motions.' + motionIndex + '.comments'] = commentToPush;
  Squeaks.update({_id: squeak._id}, {$push: push});

  // Create a new activity
  if (squeak.watchers.length) { 
    createActivity({type: 'workflowMotionComment',
          action: {_id: commentToPush._id, motionId: motionId}, 
          watched: {type: 'squeak', _id: squeak._id},
          users: squeak.watchers
        }, env);
  }

  // And the Viscosity Event
  addViscosityEvent([user], 'commentOnSqueak'); // treat this sort of comment like any other for VE purposes

  return true;
}
/**
 * Comment on a Squeak
 * @param  {String} squeakId The ID of the Squeak to comment on
 * @param  {String} comment  The comment
 * @param {Object} env the calling environment, necessary for using getUserId() if called from a Metor Method.
 * @return {Boolean}         true on success
 * @author  moore
 * @todo  move this into a comments collection so that they can be edited / whatever separately?
 */
commentOnSqueak = function commentOnSqueak(squeakId, comment, env) {
  var user = getCurrentUserId(env);
  var squeak; 
  var commentToPush;
  var _this = this;
  
  check(user, String);
  check(squeakId, String);
  check(comment, String);
  if (!comment) { throw new Meteor.Error('Comment cannot be blank!'); }

  squeak = Squeaks.findOne({_id: squeakId});
  if ( !squeak ) { throw new Meteor.Error('Cannot comment on Squeak; Squeak does not exist!'); }
  
  commentToPush = {_id: new Mongo.Collection.ObjectID().valueOf(),
                author: user, 
                comment: comment,
                createdAt: new Date()};

  Squeaks.update({_id: squeakId}, {$push: {comments: commentToPush}});

  // Notify all watching users that this Squeak was commented on
  // Build the notification:
  if (squeak.watchers.length) {
    notification = {
      type: 'comment',
      action: {_id: commentToPush._id, user: user}, // including user here simplifies subscription
      watched: {type: 'squeak', _id: squeakId},
      users: squeak.watchers
    }
  }

  createActivity(notification, env);
  addViscosityEvent([user], 'commentOnSqueak'); // add this to the user's profile
  
  return true;
}
/**
 * delete a Squeak given its ID
 * @param  {String} squeakId The ID of a Squeak in the Squeaks collection
 * @param {Object} env the calling environment, necessary for using getUserId() if called from a Metor Method.
 * @return {Boolean} true on success
 */
deleteSqueak = function deleteSqueak(squeakId, env) { 
  var user = getCurrentUserId(env);
  var squeak; 
  var alerted;

  check(user, String); // if not logged in, this should fail
  squeak = Squeaks.findOne({_id: squeakId});
  if ( !squeak ) { throw new Meteor.Error('No such Squeak: ' + squeakId); }
  if ( squeak.author !== user ) { throw new Meteor.Error('Cannot delete Squeak; user is not author.'); }
  confirmOpen(squeak);
  
  Activities.remove({'watched.type': 'squeak', 'watched._id': squeakId}); // These are meaningless now
  Activities.remove({'action.type': 'squeak', 'action._id': squeakId}); // These are meaningless now
  if (squeak.axles.length) { decrementSqueakCounts(squeak.axles); } // decrement the squeak count for each axle
  
  Squeaks.remove({_id: squeakId}); // finally, pull that bad boy.

  // create a notification about the Squeak having been deleted:
  if (squeak.watchers.length) { 
    createActivity({type: 'watchedSqueakDeleted', 
                    action: {title: squeak.title, user: user},
                    watched: {title: squeak.title},
                    users: squeak.watchers}, env);
  }

  alerted = squeak.watchers;
  _.each(squeak.axles, function(axleId) { 
    var axle = Axles.findOne({_id: axleId});
    var watchers;

    if (axle.watchers.length) { 
      watchers = _.difference(axle.watchers, alerted);
      if (watchers.length) { 
        createActivity({type: 'squeakDeletedFromAxle', 
                    action: {title: squeak.title, user: user},
                    watched: {_id: axle._id},
                    users: watchers}, env);
        alerted = _.union(watchers, alerted);
      }
    }
  });
  
  return true;
}
/**
 * Edit a Squeak
 * @param  {String} squeakId The ID of the Squeak to edit
 * @param  {String} field    The field of the Squeak to edit; must be one of title, description, reCreation, target
 * @param  {String} value    The new value of said field.  Cannot be blank.
 * @return {Boolean}          true on success, false on failure
 */
editSqueak = function editSqueak(squeakId, field, value, env) {
  var user = getCurrentUserId(env);
  var edit;
  var editId;
  var newSet;
  var squeak;
  var timestamp;
  
  check(user, String);
  check(field, String);
  check(value, String);
  if (!value) { 
    throw new Meteor.Error('This field cannot be empty!');
  }

  if (!_.contains(['title', 'description', 'reCreation', 'target'], field)) { 
    throw new Meteor.Error('Only title, description, reCreation, and target are valid fields to edit!');
  }

  if (field === 'title') { 
    if (squeakTitleExists(value)) { 
      throw new Meteor.Error('A Squeak with that title already exists! Please select a unique title');
    }
  }

  squeak = Squeaks.findOne({_id: squeakId});
  if ( !squeak ) { throw new Meteor.Error('No such Squeak: ' + squeakId); }
  confirmOpen(squeak);
  if (squeak.author !== user) { throw new Meteor.Error('Cannot edit Squeak; user is not author.'); }

  timestamp = new Date();

  // Prep the edit
  edit = {
    reference: {collection: 'squeaks', _id: squeak._id, field: field},
    before: squeak[field],
    after: value,
    user: user,
    timestamp: new Date()
  };

  // Prep the new object / value to set in the Squeak
  newSet = {};
  newSet[field] = value;
  newSet[field + 'Edit'] = timestamp;
  editId = Edits.insert(edit);

  Squeaks.update({_id: squeakId}, {$set: newSet});

  // Create an activity from the edit:
  if (squeak.watchers.length) { 
    createActivity({
      type: 'squeakEdited',
      action: {type: 'edit', _id: editId, user: user},
      watched: {type: 'squeak', _id: squeak._id},
      users: squeak.watchers
    }, env);
  }

  return true;
}
/**
 * Get a random Squeak ID from the Squeaks collection on the server
 * @return {String} The ID of a random Squeak
 */
getRandomSqueakId = function getRandomSqueakId() { 
  // Figure out a random # between 0 and #documents:
  var cnt = Squeaks.find().count(); // this seems like a bad way to do this
  if (cnt === 0) { return {}; }
    
  var randInt = Math.floor(Math.random() * Squeaks.find().count()); 
    
  return Squeaks.findOne({}, {limit: -1, skip: randInt})._id;
}
/**
 * Initiate a Squeak workflow motion
 * @param  {String} squeakId The ID of the Squeak in question
 * @param  {Object} proposal of type {proposedState: String, comment: String, reason: String -- optional}
 * @param  {Object} env      The current env to get the user from
 * @return {Boolean} true on success
 */
initiateSqueakMotion = function initiateSqueakMotion(squeakId, proposal, env) { 
  var user = getCurrentUserId(env);
  var squeak = Squeaks.findOne({_id: squeakId});
  var isWithdrawn = false;
  var viscosityRating;
  var motion;

  if (!squeak) { 
    throw new Meteor.Error('No such Squeak!');
  }

  if (!_.contains(['Squeaky', 'Greased', 'Rejected'], proposal.proposedState)) { 
    throw new Meteor.Error('proposedState must be one of Squeaky, Greased, or Rejected!');
  }

  if (proposal.proposedState === 'Squeaky' && !_.contains(['Greased', 'Rejected'], squeak.state)) { 
    throw new Meteor.Error('Cannot move to re-open a Squeak that\'s already open');
  }

  if (_.contains(['Greased', 'Rejected'], squeak.state) && _.contains(['Greased', 'Rejected'], proposal.proposedState)) { 
    throw new Meteor.Error('Cannot move to reject or grease a Squeak that has already been rejected or greased!');
  }

  if (proposal.proposedState === 'Rejected') { 
    if (!_.contains(['Withdrawn', 'Offensive', 'Duplicate', 'Unproductive'], proposal.reason)) { 
      throw new Meteor.Error('Reason must be one of Withdrawn, Offensive, Duplicate, or Unproductive!');
    }

    if (proposal.reason === 'Withdrawn') { 
      if (user !== squeak.author) { 
        throw new Meteor.Error('Only the author can withdraw the Squeak');
      } else { 
        isWithdrawn = true;
      }
    }
  }

  if (!proposal.comment) { 
    throw new Meteor.Error('You must provide a comment indicating why the workflow state should change');
  }

  // If there's already an identical motion, don't let this one in:
  if (_.find(squeak.motions, function(mo) { return mo.proposedState === proposal.proposedState && mo.state === 'Open' })) { 
    throw new Meteor.Error('There is already a proposal to move this Squeak to ' + proposal.proposedState);
  }

  viscosityRating = calculateViscosityRating(Meteor.users.findOne({_id: user}));

  // the author should always be able to withdraw regardless of rating and any user can propose a solution
  if (viscosityRating < 100 && !(isWithdrawn || proposal.proposedState === 'Greased')) {  
    throw new Meteor.Error('Users with a Viscosity Rating less than 100 cannot initiate a Squeak workflow state change!');
  }

  motion = {_id: new Mongo.Collection.ObjectID().valueOf(), 
            proposedState: proposal.proposedState,
            previousState: squeak.state, // the current state of the Squeak to resolve ambiguity if this gets defeated.
            reason: proposal.reason,
            user: user,
            created: new Date(),
            resolved: null,
            comment: proposal.comment,
            state: 'Open',
            score: viscosityRating,
            comments: [],
            voters: [{userId: user, isFor: true}]
  };

  Squeaks.update({_id: squeakId}, {$push: {motions: motion}, $set: {state: 'Under inspection'}});
  addViscosityEvent([user], (proposal.proposedState === 'Greased' ? 'proposeSqueakSolution' : 'moveToClose'));

  createActivity({type: 'workflowMotionInitiated',
                  action: {_id: motion._id},
                  watched: {type: 'squeak', _id: squeak._id},
                  users: squeak.watchers}, 
                  env);

  if (motion.score >= 1000 || isWithdrawn) { // user can withdraw without submitting to a vote
    resolveMotion(motion._id, true, env);
  }

  return true;
}
/**
 * Server-side function for inserting a Squeak into the Squeak collection.  See the Meteor Method below.
 * @param  {Object} semiSqueak The Squeak description and title.
 * @param {Object} env the calling environment, necessary for using getUserId() if called from a Metor Method.
 * @return {String}            The newly-inserted Squeak's ID
 */
insertSqueak = function insertSqueak(semiSqueak, env) {
  var user = getCurrentUserId(env); // see users-collection.js
  var squeak;
  var squeakId;

  check(user, String); // if not logged in, this should fail

  check(semiSqueak, {
    title: String,
    description: String,
    reCreation: String,
    target: String
  });

  // Make sure they're non-empty:
  if (!semiSqueak.title || 
    !semiSqueak.description ||
    !semiSqueak.reCreation ||
    !semiSqueak.target
  ) { throw new Meteor.Error('Title, description, re-creation, and target are all required fields!'); }

  // Make sure title is unique:
  if (squeakTitleExists(semiSqueak.title)) { 
    throw new Meteor.Error('A Squeak with title \'' + semiSqueak.title + '\' already exists!  Please select a new title');
  }
  
  var squeak = _.extend({
    author: user, 
    state: 'Squeaky',
    motions: [],
    createdAt: new Date(),
    comments: [],
    votes: 0,
    voters: [user], // include user in the voters so they can't vote for their own posts
    axles: [],
    watchers: [user] // user should watch his own Squeaks!
  }, semiSqueak);
  
  squeakId = Squeaks.insert(squeak);
  addViscosityEvent([user], 'insertSqueak');

  return squeakId;
}
/**
 * Remove a Squeak from an Axle
 * @param  {String} squeakId The ID of the Squeak to remove from the Axle
 * @param  {String} axleName The name of the Axle to remove the Squeak from
 * @param {Object} env the calling environment, necessary for using getUserId() if called from a Metor Method.
 * @return {Boolean} true on success
 * @author  moore
 */
removeSqueakFromAxle = function removeSqueakFromAxle(squeakId, axleName, env) {
  var user = getCurrentUserId(env);
  var squeak;
  var axle;
  var axleId;

  check(user, String);
  check(squeakId, String);

  squeak = Squeaks.findOne({_id: squeakId});
  if (!squeak) { throw new Meteor.Error('Cannot remove Squeak from Axle; Squeak does not exist!'); } 

  // May want to include a viscosity rating or Axle ownership here?
  if (squeak.author !== user) { throw new Meteor.Error('Only the Squeak author can remove a Squeak from an Axle!'); }

  axle = Axles.findOne({name: axleName});
  if (!axle) { throw new Meteor.Error('Cannot remove Axle from Squeak; no such Axle!'); }
  
  axleId = axle._id
  if (_.contains(squeak.axles, axleId)) { // needs to be wrapped in this if statement to deal with inc'ing the squeakCount
    Squeaks.update({_id: squeakId}, {$pull: {axles: axleId}});
    Axles.update({_id: axleId}, {$inc: {squeakCount: -1}});
    watchers = Axles.findOne({_id: axleId}).watchers;
    if (watchers.length) { 
      createActivity({type: 'squeakRemovedFromAxle',
        action: {type: 'squeak', _id: squeak._id, user: user},
        watched: {_id: axleId},
        users: watchers
      }, env);
    }
  }
  
  return true;
}
/**
 * Resolve a motion and perform the necessary state transition
 * @param  {String}  motionid The ID of the motion in question
 * @param  {Boolean} isPass   Whether the motion passed (true) or failed (false)
 * @param  {Object}  env      The calling environment, from which can be pulled the user
 * @return {Boolean}          True on success, false on failure
 */
resolveMotion = function resolveMotion(motionId, isPass, env) {
  var squeak = Squeaks.findOne({'motions._id': motionId});
  if (!squeak) { throw new Meteor.Error('No Squeak with that Motion ID!'); }
  
  var motionIndex = findIndex(squeak.motions, function(mo) { return mo._id === motionId; });
  var motion = squeak.motions[motionIndex];
  var user = getCurrentUserId(env);
  var timestamp = new Date();
  var motionsToResolve;
  var voters;
  
  if (motion.state !== 'Open') { 
    throw new Meteor.Error('Cannot resolve motion; motion is already resolved!');
  }

  // If the user is the author, they can resolve to accept a motion to Grease if the motion's score < 1000 either way
  if (Math.abs(motion.score) < 1000) { 
    // This is fine if we're the author is accepting or rejecting a solution
    // or if the user is rejecting his own proposal
    // Or if the Squeak is being withdrawn
    if (!((motion.proposedState === 'Greased' && squeak.author === user) || 
      (user === motion.user && !isPass) ||
      squeak.author === user && motion.proposedState === 'Rejected' && motion.reason === 'Withdrawn')) { 
      throw new Meteor.Error('The Squeak author can accept or reject a solution or withdraw his or her Squeak, ' +
          'and the user who initiated the motion can withdraw his own motion, but no other out of merit resolutions are allowed.');
    }
  } else { 
    if ((isPass && motion.score < 0) || (!isPass && motion.score > 0)) { 
      throw new Meteor.Error('Cannot accept or reject a motion in contradiction to its score!');
    }
  }

  update = {};
  motionsToResolve = [{_id: motionId, index: motionIndex, resolution: isPass ? 'Accepted' : 'Rejected' }];
  
  if (isPass) { // Go ahead and update the Squeak itself; if it doesn't pass, keep it the way it is!
    update.state = motion.proposedState;
    _.each(squeak.motions, function(mo, index) { 
      if ( mo._id !== motionId && mo.state === 'Open') { 
        motionsToResolve.push({_id: mo._id, index: index, resolution: 'Rejected'});
      }
    });
  } else { 
    // If there's no other open motions, we need to move the Squeak back to Squeakytown or Greasedville as appropriate
    if (!_.some(squeak.motions, function(mo) { return mo._id !== motionId && mo.state === 'Open'; })) { 
      update.state = motion.previousState;
    }
  }

  // And update all the motions themselves too and send out notifications
   _.each(motionsToResolve, function(mo) { 
    update['motions.' + mo.index + '.state'] = mo.resolution;
    update['motions.' + mo.index + '.resolved'] = timestamp;
    createActivity({type: 'workflowMotionResolved',
                  action: {_id: mo._id},
                  watched: {type: 'squeak', _id: squeak._id},
                  users: squeak.watchers}, env);
  });

  Squeaks.update({_id: squeak._id}, {$set: update});
  
  // Deal with the viscosity events...
  // action user is special among voters; he won't get the benefit of the vote but he'll get something BETTER (or... worse I guess depending)
  voters = _.reject(motion.voters, function(voter) { return voter.userId === motion.user; });
  addViscosityEvent(_.pluck(_.filter(voters, function(voter) { return voter.isFor === isPass; }), ('userId')), 'votedCorrectly');
  addViscosityEvent(_.pluck(_.reject(voters, function(voter) { return voter.isFor === isPass; }), ('userId')), 'votedIncorrectly');
  if (motion.proposedState === 'Greased') { 
    addViscosityEvent([motion.user], (isPass ? 'resolutionPassed' : 'resolutionRejected'));
  } else { 
    addViscosityEvent([motion.user], (isPass ? 'motionPassed' : 'motionRejected'));
  }

  // And don't forget the author
  if (isPass && motion.proposedState === 'Greased') { 
    addViscosityEvent([squeak.author], 'squeakResolved');
  } else if (isPass && motion.proposedState === 'Rejected') { 
    addViscosityEvent([squeak.author], 'squeakRejected'); // we don't give the author anything if it gets re-opened.
  }

  return true;
}
/**
 * Tag a Squeak to an Axle
 * @param  {String} squeakId The ID of the Squeak to tag
 * @param  {String} axleName The name of the Axle to tag (the ID will be looked up)
 * @param {Object} env the calling environment, necessary for using getUserId() if called from a Metor Method.
 * @return {Boolean} true on success
 * @author  moore
 */
tagSqueakToAxle = function tagSqueakToAxle(squeakId, axleName, env) { 
  var user = getCurrentUserId(env);
  var squeak;
  var axleId;

  check(user, String);
  check(squeakId, String);

  squeak = Squeaks.findOne({_id: squeakId});
  if (!squeak) { throw new Meteor.Error('Cannot tag Squeak to Axle; Squeak does not exist!'); } 

  // May want to include a viscosity rating or Axle ownership here?
  if (squeak.author !== user) { throw new Meteor.Error('Only the Squeak author can tag a Squeak to an Axle!'); }

  axleId = createAxle(axleName);
  if (!_.contains(squeak.axles, axleId)) { // needs to be wrapped in this to deal with the squeakCount, notifications
    Squeaks.update({_id: squeakId}, {$addToSet: {axles: axleId}});
    Axles.update({_id: axleId}, {$inc: {squeakCount: 1}});
    watchers = Axles.findOne({_id: axleId}).watchers;
    if (watchers.length) { 
      createActivity({type: 'squeakTaggedToAxle',
        action: {type: 'squeak', _id: squeak._id, user: user},
        watched: {_id: axleId},
        users: watchers
      }, env);
    }
  }

  return true;
}
/**
 * Logged-in user un-watch a Squeak
 * @param {String} squeakId The ID of the Squeak to stop watching
 * @param {Object} env the calling environment
 * @return {Boolean} true on success
 */
unwatchSqueak = function unwatchSqueak(squeakId, env) { 
  var user = getCurrentUserId(env);
  var squeak = Squeaks.findOne({_id: squeakId});

  if (!squeak) { throw new Meteor.Error('No such Squeak!'); }
  
  Squeaks.update({_id: squeakId}, {$pull: {watchers: user}});
  
  return true;
}
/**
 * Upvote a Squeak
 * @param  {String} squeakId The Squeak to vote on
 * @param {Object} env the calling environment, necessary for using getUserId() if called from a Metor Method.
 * @return {Boolean} true on success
 * @author  moore
 */
voteForSqueak = function voteForSqueak(squeakId, env) { 
  var user = getCurrentUserId(env);
  var squeak;

  check(user, String);
  check(squeakId, String);

  squeak = Squeaks.findOne({_id: squeakId});
  if (!squeak) { throw new Meteor.Error('Cannot vote on Squeak; Squeak does not exist!'); }
  
  Squeaks.update({
      _id: squeakId,
      voters: {$ne: user}, // Can't vote if you've already voted
    }, {
      $addToSet: {voters: user},
      $inc: {votes: 1}
  });

  addViscosityEvent([user], 'voteForSqueak');

  return true;
}
/**
 * Vote on a Squeak workflow motion
 * @param {String} motionId The ID of the motion to vote for
 * @param {Boolean} isFor Whether the vote is for (true) or against (false) the motion in question
 * @param {Object} [env] the calling environment so we can get the user out
 * @return {Boolean} True on success
 */
voteOnMotion = function voteOnMotion(motionId, isFor, env) { 
  check(motionId, String);
  check(isFor, Boolean);
  var user = Meteor.users.findOne({_id: getCurrentUserId(env)});
  var squeak = Squeaks.findOne({'motions._id': motionId});
  var motionIndex;
  var motion;
  
  if (!squeak) { throw new Meteor.Error('No Squeaks with given motion ID!'); }

  motionIndex = findIndex(squeak.motions, function(mo) { return mo._id === motionId; }); // pretty sure that's guaranteed to work given above
  motion = squeak.motions[motionIndex];
  
  if (motion.state !== 'Open') { 
    throw new Meteor.Error('Cannot vote on a closed motion!');
  }

  if (_.contains(_.pluck(motion.voters, 'userId'), user._id)) { 
    throw new Meteor.Error('Cannot vote for the same motion twice!');
  }

  inc = {};
  inc['motions.' + motionIndex + '.score'] = calculateViscosityRating(user) * (isFor ? 1 : -1);

  setAdd = {}
  setAdd['motions.' + motionIndex + '.voters'] = {userId: user._id, isFor: isFor};

  Squeaks.update({_id: squeak._id}, {$inc: inc, $addToSet: setAdd});
  addViscosityEvent([user._id], 'voteOnMotion');
  
  // Now pull it back in and see if we are the deciding vote:
  motion = Squeaks.findOne({_id: squeak._id}).motions[motionIndex];
  if (Math.abs(motion.score) >= 1000) { 
    resolveMotion(motionId, (motion.score > 0), env);
  }

  return true;
}
/**
 * Logged-in user sign up to watch a Squeak
 * @param {String} squeakId The ID of the Squeak to watch
 * @param {Object} env the calling environment
 * @return {Boolean} true on success
 */
watchSqueak = function watchSqueak(squeakId, env) { 
  var user = getCurrentUserId(env);
  var squeak = Squeaks.findOne({_id: squeakId});

  if (!squeak) { throw new Meteor.Error('No such Squeak!'); }

  Squeaks.update({_id: squeakId}, {$addToSet: {watchers: user}});

  return true;
}
/**
 * Return a plaintext explanation of any workflow state
 * @param  {state} state The workflow state whose explanation you want
 * @return String an plaintext explanation of the workflow state
 */
workflowExplanation = function workflowExplanation(state) { 
  if (state === 'Squeaky') { 
    return 'An existing problem dying to be solved!';
  } else if (state === 'Under inspection') { 
    return 'A problem with a potential solution.  Go weigh in!';
  } else if (state === 'Greased') { 
    return 'This problem\'s solved!';
  } else if (state === 'Rejected') { 
    return 'This problem wasn\'t a valid candidate for Squeaky Wheel.'
  }
}
/**
 * Methods for operating on the Squeak collection
 * @author  moore
 */
Meteor.methods({
  /**
   * Comment on a workflow motion
   * @param {String} motionId The _id of the motion in question
   * @param {String} comment the comment to add to the motion
   */
  commentOnMotion: function(motionId, comment) { 
    return commentOnMotion(motionId, comment, this);
  },  
  /**
   * Comment on a Squeak
   * @param  {String} squeakId The ID of the Squeak to comment on
   * @param  {String} comment  The comment
   * @return {Boolean}         true on success
   * @author  moore
   * @todo  move this into a comments collection so that they can be edited / whatever separately?
   */
  commentOnSqueak: function(squeakId, comment) {
    return commentOnSqueak(squeakId, comment, this);
  },
  /**
   * Delete a Squeak from the Squeaks collection -- probably? just used for testing? for now?
   * @param  {String} squeakId The ID of a Squeak in the Squeaks collection
   * @return {Boolean} true on success
   * @author  moore
   */
  deleteSqueak: function(squeakId) {
    return deleteSqueak(squeakId, this);
  },
  /**
   * Edit a Squeak
   * @param  {String} squeakId The ID of the Squeak to edit
   * @param  {String} field    The field of the Squeak to edit; must be one of title, description, reCreation, target
   * @param  {String} value    The new value of said field.  Cannot be blank.
   * @return {Boolean}          true on success, false on failure
   */
  editSqueak: function(squeakId, field, value) { 
    return editSqueak(squeakId, field, value, this);
  },
  /**
   * Get a random Squeak ID from the Squeaks collection on the server
   * @return {String} The ID of a random Squeak
   */
  getRandomSqueakId: function() { 
    return getRandomSqueakId();
  },
  /**
   * Initiate a Squeak workflow motion
   * @param  {String} squeakId The ID of the Squeak in question
   * @param  {Object} motion of type {proposedState: String, comment: String, reason: String -- optional}
   * @return {Boolean} true on success
   */
  initiateSqueakMotion: function(squeakId, motion) { 
    return initiateSqueakMotion(squeakId, motion, this);
  },
  /**
   * Insert a Squeak into the collection
   * @param  {Object} protoSqueak The client-configurable Squeak options, including title and description.
   * @return {String} the ID of the inserted Squeak
   * @author  moore
   */
  insertSqueak: function(semiSqueak) {
    return insertSqueak(semiSqueak, this); // pass along the environment
  },
  /**
   * Remove a Squeak from an Axle
   * @param  {String} squeakId The ID of the Squeak to remove from the Axle
   * @param  {String} axleName The name of the Axle to remove the Squeak from
   * @return {Boolean} true on success
   * @author  moore
   */
  removeSqueakFromAxle: function(squeakId, axleName) {
    return removeSqueakFromAxle(squeakId, axleName, this);
  },
  /**
   * Resolve a motion and perform the necessary state transition
   * @param  {String}  motionId The ID of the motion in question
   * @param  {Boolean} isPass   Whether the motion passed (true) or failed (false)
   * @return {Boolean}          True on success, false on failure
   */
  resolveMotion: function(motionId, isPass) {
    return resolveMotion(motionId, isPass, this);
  },
  /**
   * Determine whether a Squeak title exists or not
   * @param  {String} title the title of the Squeak in question
   * @return {Boolean}       True if the title already exists, false otherwise
   */
  squeakTitleExists: function(title) { 
    return squeakTitleExists(title);
  },
  /**
   * Tag a Squeak to an Axle
   * @param  {String} squeakId The ID of the Squeak to tag
   * @param  {String} axleName The name of the Axle to tag (the ID will be looked up)
   * @return {Boolean} true on success
   * @author  moore
   */
  tagSqueakToAxle: function(squeakId, axleName) { 
    return tagSqueakToAxle(squeakId, axleName, this);
  },
  /**
   * Currently logged-in user signs up for Squeak notifications
   * @param {String} [squeakId] The Squeak to stop receiving notifications about
   * @return {Boolean} true on success
   */
  unwatchSqueak: function(squeakId) { 
    return unwatchSqueak(squeakId, this);
  },
  /**
   * Upvote a Squeak
   * @param  {String} squeakId The Squeak to vote on
   * @return {Boolean} true on success
   * @author  moore
   */
  voteForSqueak: function(squeakId) { 
    return voteForSqueak(squeakId, this);
  },
  /**
   * Vote on a Squeak workflow motion
   * @param {String} motionId The ID of the motion to vote for
   * @param {Boolean} isFor Whether the vote is for (true) or against (false) the motion in question
   * @return {Boolean} True on success
   */
  voteOnMotion: function(motionId, isFor) { 
    return voteOnMotion(motionId, isFor, this);
  },
  /**
   * Currently logged-in user signs up for Squeak notifications
   * @param {String} [squeakId] The Squeak to watch
   * @return {Boolean} true on success
   */
  watchSqueak: function(squeakId) { 
    return watchSqueak(squeakId, this);
  }
});
