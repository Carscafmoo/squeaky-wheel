/**
 * Helpers for the tutorial activity list
 */
Template.tutorialActivityListPage.helpers({
  exampleData: function() {
    return [
      createNewActivity({
        action : { user : Meteor.userId(), ack: false }, 
        created : new Date(new Date().getTime() - 600 * 1000),
        type : "tutorialExample", 
        users : [{  userId : Meteor.userId(),  ack : false }], 
        watched : {} 
      }),
      createNewActivity({
        action : { user : Meteor.userId(), ack: true }, 
        created : new Date(),
        type : "tutorialExample", 
        users : [{  userId : Meteor.userId(),  ack : true }], 
        watched : {} 
      })
    ]
  }
});