/**
 * Client-side startup functions
 */
Meteor.startup(function() { 
  /** 
   * Clear out all session variables every time a user logs out -- note, there's no onLogout hook... yet???
   */
  if (Meteor.isClient) { 
    Deps.autorun(function() { // register a reactive function around the Meteor.userId() reactive var
      if (!Meteor.userId()) {
        Session.keys = {};
      }
    });
  }
});