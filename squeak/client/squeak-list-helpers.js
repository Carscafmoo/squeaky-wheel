/** 
 * Event handlers
 * @author  moore
 */
Template.squeakList.events({
  /**
   * Listen for form enter if users are searching by axle
   */
  'submit #axle-restriction-form': function(event) { 
    event.preventDefault();
    var newAxle = $('#axle-restriction-input').val().trim();
    
    if (!newAxle) { Session.set('squeakListAxle', null); }
    else { Session.set('squeakListAxle', newAxle); }
  }
});