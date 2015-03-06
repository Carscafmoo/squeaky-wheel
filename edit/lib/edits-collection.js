/**
 * This file contains definitions of and methods for working with field edits.
 * @author moore
 */
/**
 * The collection of field edits has the following schema:
 * _id: {String} Mongo ID
 * reference: {Object} indicating the field reference that was edited:
 *   {collection: {String} the collection edited,
 *     _id: {String} the _id of the documented within that collection that was edited
 *     field: {String} the field that was edited
 *    }
 * before: {mixed} value of the field prior to edit
 * after: {mixed} value of the field after edit (i.e., new field value)
 * user: {String} _id of the ser performing the edit
 * timestamp: {Date} timestamp of edit
 * @type {Mongo}
 */
Edits = new Mongo.Collection('edits');

if (Meteor.isServer) { 
  Meteor.publish('editsByIds', function(ids) { 
    check(ids, [String]);
    return Edits.find({_id: {$in: ids}});
  });
}