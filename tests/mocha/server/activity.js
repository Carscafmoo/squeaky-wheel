if (!(typeof MochaWeb === 'undefined') && true) {
  MochaWeb.testOnly(function() {
    var should = chai.should();
    var expect = chai.expect;
    var testUser = 'test_user';
    var otherUser = 'test_user1';
    var getTestUser = function getTestUser() { return Meteor.users.findOne({username: testUser}); }
    var getOtherUser = function getOtherUser() { return Meteor.users.findOne({username: otherUser}); }
    var loginTestUser = function loginTestUser() { this.userId = getTestUser()._id; }
    var loginOtherUser = function loginOtherUser() { this.userId = getOtherUser()._id; }
    var logout = function logout() { this.userId = null; }

    var testActivity = {
      type: 'test',
      action: {subscription: 'test', _id: 'test'},
      watched: {subscription: 'test', _id: 'test'},
      users: [getTestUser()._id]
    }
    
    var resetActivities = function() { 
      Activities.remove();
    }
    /**
     * Login as the other user, notify the current user (create an un-ack'd activity), and log out
     * @return {String} The ID of the newly-created activity
     */
    var createTestActivity = function createTestActivity() {
      var returnVal;
      loginOtherUser();
      returnVal = createActivity(testActivity);
      logout();

      return returnVal;
    }
    
    describe('User activity notification server-side API', function() { 
      /**
       * before each one make sure there are no notification for either user
       */
      beforeEach(function() { 
        resetActivities();  
      });

      afterEach(function() { 
        resetActivities();
      });

      it('Should not be possible to create activities for fake users', function() { 
        var myTestActivity = JSON.parse(JSON.stringify(testActivity)); // clone
        var test;
        
        myTestActivity.users = ['totally_fake_user'];
        loginOtherUser();
        test = function() { createActivity(myTestActivity); }
        expect(test).to.throw('non-zero number of existing users');
        logout();
      }); // end can't notify fake users

      it('Should reject malformed activities', function() { 
        loginOtherUser();
        var test = function() { createActivity({malformed: true}); }
        expect(test).to.throw('Match error');
        logout();
      }); // end reject malformed activities

      it('Should be possible to create an activity for a real user', function() { 
        var testActivityId = createTestActivity();
        var activity;
        
        expect(testActivityId).to.be.a.String;

        activity = Activities.findOne({_id: testActivityId});
        expect(activity).to.exist;
        expect(activity.users[0].ack).to.be.false;
      }); // end can notify real user

      it('Should automatically update self-activities to be acknowledged for the logged-in user', function() { 
        var testActivityId;
        
        loginTestUser(); // fake login
        testActivityId = createActivity(testActivity);
        logout();

        expect(testActivityId).to.be.a.String;

        activity = Activities.findOne({_id: testActivityId});
        expect(activity).to.exist;
        expect(activity.users[0].ack).to.be.true;
      }); // end automatically updates 
    }); // end describe server-side API
    /** 
     * Assumes the user is not logged in at the begginning and end of each test.
     * Assumes the test user has no unread activities.
     */
    describe('The Activity module', function() {
      beforeEach(function() {
        logout();
        resetActivities();
      });

      afterEach(function() { 
        logout();
        resetActivities();
      });
      
      it('Should be possible to acknowledge a real activity', function() { 
        var testId = createTestActivity();
        
        loginTestUser();
        expect(ackActivity(testId)).to.be.true;
        var activity = Activities.findOne({_id: testId});
        
        expect(activity.users[0].ack).to.be.true;
        resetActivities();
        logout();
      }); // end should be ack-able
      /**
       * @todo get rid of testNotify()
       */
      it('Should not be possible to acknowledge a fake activity', function() { 
      // testNotification passes the notification specs, but shouldn't be found in the collection (it doesn't have created, etc.)
        var test = function test() { return ackActivity("fake"); }
        var testId = createTestActivity(); // create this so we can check that it *doesn't* get ack'd.
        loginTestUser();
        expect(test).to.throw('No such activity');
        expect(Activities.findOne({_id: testId}).users[0].ack).to.be.false;
        resetActivities();
        logout();
      }); // end should not be possible to ack fake notification
    }); // end describe interacting with one's own notifications
  }); // end mochaweb.testonly
}