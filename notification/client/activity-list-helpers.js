/**
 * Helpers for the activityList template
 */
Template.activityList.helpers({
  /**
   * Return the motion whose discussion to display
   * @return {SqueakMotion} 
   */
  getDiscussionMotion: function() { 
    var moId = Session.get('discussionMotion');
    var squeak = Squeaks.findOne({'motions._id': moId});
    if (squeak) { return _.findWhere(squeak.motions, {_id: moId}); }

    return {};
  }
});
