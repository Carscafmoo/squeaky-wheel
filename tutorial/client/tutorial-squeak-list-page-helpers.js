/**
 * Helpers for Squeak List tutorial
 * @author moore
 */
Template.tutorialSqueakListPage.helpers({
  /**
   * Return text in the link to view Squeaks
   */
  squeakListLink: function() { 
    return $('#view-squeaks').text(); 
  },
  /**
   * Return the list of Tutorial Squeaks we have awailable
   */
  squeaks: function() { 
    return Squeaks.find(); 
  }
});

