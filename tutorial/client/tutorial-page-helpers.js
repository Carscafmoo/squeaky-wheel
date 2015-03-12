/** 
 * Dictionary pointing hashes to data
 */
var templateDictionary = [
    {name: 'Welcome', template: 'tutorialWelcomePage' },
    {name: 'Squeaks', template: 'tutorialSqueakPage' }, // First cover what a Squeak is
    {name: 'Squeaking', template: 'tutorialCreateSqueakPage' }, // transition to how to create one
    {name: 'Finding Squeaks: Search Page', template: 'tutorialSearchPage' }, // Don't forget to search before you create...
    {name: 'Axles', template: 'tutorialAxleListPage' }, // Also, check out relevant axles...
    {name: 'Watching and Notifications', template: 'tutorialActivityListPage' }, // What watching means 
    {name: 'Squeak Workflow', template: 'tutorialSqueakWorkflowPage' }, // How to manage Squeaks 
    {name: 'Viscosity Rating', template: 'tutorialViscosityRatingPage'},
    {name: 'Discussion', template: 'tutorialCommentsPage' }, // Discussion drives Squeaks through the workflow states
    {name: 'Start Squeaking', template: 'tutorialCompletePage' } // Annnnd we're done
  ];
/**
 * Find out what the current hash is
 *   Using Iron.controller makes this reactive
 * @return {Integer}
 */
var currentHash = function currentHash() { 
  var hash = parseInt(Iron.controller().getParams().hash);
  
  return hash ? hash : 0; 
}
/**
 * When created, set the session variable to templates know we're in the tour
 */
Template.tutorialPage.created = function() { 
  Session.set("isTutorial", true);
}
/**
 * And when we leave, re-set that session var
 */
Template.tutorialPage.destroyed = function() { 
  Session.set("isTutorial", false);
}
/**
 * Helpers for the tutorial page
 */
Template.tutorialPage.helpers({
  /**
   * Return the name of the template associated with this hash
   * @return String
   */
  hashTemplate: function() { 
    return templateDictionary[currentHash()].template;
  },
  /**
   * Is there a next page
   * @return {Boolean} 
   */
  hasNext: function() { 
    return currentHash() !== templateDictionary.length - 1;
  },
  /**
   * Is there a previous page
   * @return {Boolean} 
   */
  hasPrevious: function() { 
    return currentHash() !== 0;
  },
  /**
   * Display text for the header
   */
  headerText: function() {
    return templateDictionary[currentHash()].name;
  },
  /**
   * How many tutorial pages are there?
   * @return {Integer}
   */
  howMany: function() { 
    return templateDictionary.length;
  },
  /**
   * Get the hash # of the next page
   * @return {Integer}
   */
  nextHash: function() { 
    return currentHash() + 1; 
  },
  /**
   * Get the name of the next page
   * @return {String} 
   */
  nextPage: function() { 
    return templateDictionary[currentHash() + 1].name; 
  },
  /**
   * Return the previous hash
   * @return {Integer} 
   */
  previousHash: function() { 
    return currentHash() - 1; 
  },
  /**
   * Get the name of the previous page
   * @return {String} 
   */
  previousPage: function() { 
    return templateDictionary[currentHash() - 1].name; 
  },
  /**
   * Which of the pages are you on?
   * @return {Integer}
   */
  whichAmI: function() { 
    return currentHash() + 1;
  }
});
/**
 * Event listeners for the tutorial page template
 * @author  moore
 */
Template.tutorialPage.events({ 
  /**
   * Clicking the nav links should scroll you to the top of the page you linked to
   */
  'click .tutorial-nav-link': function(event) { 
    $('html, body').scrollTop(0); 
  }
});
