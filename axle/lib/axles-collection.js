/**
 * Axles is a mongo collection of Axles.
 * @type {Mongo}
 * @author  moore
 * Schema for axles is as follows:
 * _id: default
 * name: text field; < 255 characters; unique.
 * squeakCount: the # of Squeaks associated with this Axle
 * watchers: [UserID]
 * @todo
 *   ownership?
 *   some other stuff, I'm sure
 * @todo  restrict publishing to relevant fields and stuff
 * @author  moore
 */
Axles = new Mongo.Collection('axles');
var searchOpts = {
  field: 'name',
  collection: Axles,
  use: 'mongo-db',
  limit: 10,
  /**
   * Store the sortKey as a property so we can set it and have it dictate the sorting 
   * @type {Object}
   */
  props: {
    sortKey: 'p'
  },
  sort: function() { 
    if (this.props.sortKey === 'p') { return {squeakCount: -1, name: 1, _id: 1}; }
    else { return {name: 1, _id: 1}; } 
  }
};

EasySearch.createSearchIndex('axles', searchOpts);
/**
 * Publishing for the Axles
 * @author  moore
 * @todo  limit published axles
 */
if (Meteor.isServer) { 
  Meteor.publish('axleBySqueak', function(squeakId) { 
    var squeak = Squeaks.findOne({_id: squeakId});
    if (squeak) { 
      return Axles.find({_id: { $in: squeak.axles }}); 
    } else { 
      return Axles.find({_id: { $in: []}});
    }
  });

  Meteor.publish('axleById', function(axleIds) { 
    return Axles.find({_id: { $in: axleIds }});
  });

  Meteor.publish('axleByName', function(axleName) { 
    return Axles.find({name: axleName});
  });
}
/**
 * Creation of axles does not need to be a Meteor Method, since it should only be done from the Server anyway (called in other meteor methods)
 *   and will fail if done from the client since we have a deny all rule.
 *   Note: this is meant to be a global function (it gets used by Squeak methods)
 * @param  String name the name of the Axle to create (if it doesn't exist)
 * @return _id the _id of the created (or existing) axle with that name
 */
createAxle = function createAxle(name) { 
  var axle;
  check(name, String);

  axle = Axles.findOne({name: name});
  if (axle) { 
    return axle._id; 
  } else { 
    return Axles.insert({name: name, squeakCount: 0, watchers: []});
  }
}
/**
 * Decrement the number of Squeaks attached to an axle (useful if e.g. a Squeak is deleted)
 * @param  {[String]} axleIds An array containing IDs of the axles to decrement
 * @return {Boolean}        true on success
 */
decrementSqueakCounts = function decrementSqueakCounts(axleIds) { 
  Axles.update({_id: {$in: axleIds}}, {$inc: {squeakCount: -1}});
}
/**
 * Delete an axle -- cannot be done if any Squeaks are tagged to the axle.  Likely only useful in testing?
 * @param  {String} axleName the Axle name 
 * @return {true on success}          
 */
deleteAxle = function deleteAxle(axleName) {
  var user = this.userId;
  var axle;
  var testSqueak;
  
  check(user, String);
  check(axleName, String);

  axle = Axles.findOne({name: axleName});
  if (!axle) { throw new Meteor.Error('No such Axle: ' + axleName); }

  testSqueak = Squeaks.findOne({axles: axle._id});
  if (testSqueak) { throw new Meteor.Error('Cannot delete Axle that contains Squeaks!'); }

  Axles.remove({_id: axle._id});

  return true;
}
/**
 * Watch an axle
 * @param {String} axleId The _id of the axle to watch
 * @author  moore
 */
watchAxle = function watchAxle(axleId, env) { 
  var user = getCurrentUserId(env);
  var axle = Axles.findOne({_id: axleId});

  if (!axle) { throw new Meteor.Error('No such Axle!'); }

  Axles.update({_id: axleId}, {$addToSet: {watchers: user}});

  return true;
}
/**
 * Logged-in user un-watch a Axle
 * @param {String} axleId The ID of the Axle to stop watching
 * @param {Object} env the calling environment
 * @return {Boolean} true on success
 */
unwatchAxle = function unwatchAxle(axleId, env) { 
  var user = getCurrentUserId(env);
  var axle = Axles.findOne({_id: axleId});

  if (!axle) { throw new Meteor.Error('No such Axle!'); }
  
  Axles.update({_id: axleId}, {$pull: {watchers: user}});
  
  return true;
}
/**
 * Axle-related meteor methods
 * @author  moore
 */
Meteor.methods({
  /**
   * Watch an axle
   * @param {String} axleId The _id of the axle to watch
   * @author  moore
   */
  watchAxle: function(axleId) {
    return watchAxle(axleId, this);
  },
  /**
   * Logged-in user un-watch a Axle
   * @param {String} axleId The ID of the Axle to stop watching
   * @param {Object} env the calling environment
   * @return {Boolean} true on success
   */
  unwatchAxle: function(axleId) { 
    return unwatchAxle(axleId, this);
  },
  /**
   * Query axle names on the server from the client
   * @param  {String} query A regular expression to match Axle names against
   * @return {[Object]}       An array of objects
   */
  queryAxleNames: function(query) { 
    
    var names = Axles.find({name: {$regex: '.*' + query + '.*', $options: 'i'}}, 
      {sort: {matchBeginning: 1, name: 1}, // sort by whether it starts with the query text or not 
      limit: 8});/*, // Limit to 8 just so you don't overcrowd it y'know
      transform: function(object) { 
        object.matchBeginning = new RegExp('^' + query + '.*', 'i').test(object.name);
        
        return object;
      }});*/
    return names.map(function(axle) { return axle.name; }); // ugh.
  }
});
