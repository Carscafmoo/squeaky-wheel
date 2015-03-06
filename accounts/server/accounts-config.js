/**
 * Override default user creation to match our schema; generate a "joined" notification 
 * @param  {object} options The options object passed from createUser()
 * @param  {object} user   A proposed user object
 * @return {object} user if the options check out, or false if not
 * @author  moore
 */
Accounts.onCreateUser(function(options, user) {
  if (!options.email || !options.name) { 
    throw new Meteor.Error('New users must provide a name and email');
  }
  
  delete user.emails;
  user.email = options.email;
  user.name = options.name;
  user.viscosityEvents = []; // This user has no VR yet.
  user.viscosityAdmin = false; // New users cannot move to close, etc.
  if (user.profile) { delete user.profile; }

  createActivity({type: "userJoined", 
                    action: {user: user._id},
                    watched: {},
                    users: [user._id]}, {userId: user._id});
  
  return user;
});