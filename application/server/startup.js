/**
 * Perform various operations on startup:
 *   - Create necessary Mongo indices
 * @author  moore
 * @TODO un-comment disallowInlineStyles -- needed for sacha:spinner
 */
Meteor.startup(function() {
  Squeaks._ensureIndex({title: 1}, {unique: true}); // title is unique
  Squeaks._ensureIndex({votes: -1}); // sort by votes
  Squeaks._ensureIndex({axles: 1}); // look up by axles
  Squeaks._ensureIndex({watchers: 1}); // For looking up Squeaks a user is watching
  Squeaks._ensureIndex({'comments._id': 1}, {unique: true, sparse: true}); // For looking up comments by ID.  Should be unique automatically.
  Squeaks._ensureIndex({'resolutions._id': 1}, {unique: true, sparse: true});
  Squeaks._ensureIndex({'resolutions.accepted': 1}, {sparse: true});
  Squeaks._ensureIndex({'motions._id': 1}, {unique: true, sparse: true}); // For looking up motions by ID
  // Squeaks._ensureIndex({voters}); Add this in if you want to include a 'list of stuff you've voted for'
  
  Axles._ensureIndex({name: 1}, {unique: true}); // name is unique

  // Activities should have an index on the user in question to help with looking up a particular user's notifications
  Activities._ensureIndex({'users._id': 1});

  BrowserPolicy.content.disallowInlineScripts(); // Don't allow script injections
  //BrowserPolicy.content.disallowInlineStyles(); // Don't allow inline styling -- actually, we have to, for sacha:spinner
  if (process.env.IS_MIRROR && process.env.NODE_ENV !== 'production') { // for mocha testing we have to allow framing
      console.log('testing');

      var localUrl = 'http://localhost:3000';
      var mirrorUrl = 'http://localhost:5000';

      console.log("In development mode. Allowing all framing so that mocha-web can run for tests.");
      BrowserPolicy.content.allowOriginForAll("localhost:*");
      BrowserPolicy.content.allowConnectOrigin("ws://localhost:5000");
      BrowserPolicy.content.allowConnectOrigin("ws://localhost:3000");
      BrowserPolicy.content.allowFrameOrigin(mirrorUrl);
      BrowserPolicy.framing.allowAll();
    }
});