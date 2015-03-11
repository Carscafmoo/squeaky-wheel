if (!(typeof MochaWeb === 'undefined') && true) {
  MochaWeb.testOnly(function() {
    var should = chai.should();
    var expect = chai.expect;
    var testSqueakTitle = 'Test Squeak';
    var testDescription = 'This Squeak is a test.';
    var testSqueak = {title: testSqueakTitle, 
      description: testDescription, 
      reCreation: "Cannot be recreated",
      target: "All you kids out there in radioland"
    };

    var testUser = 'test_user';
    var otherUser = 'test_user1';
    var testAxle = 'TestAxle';


    var getTestSqueakId = function getSqueakId(squeakTitle) { 
      return findTestSqueak()._id;
    }

    var getTestUser = function getTestUser() { return Meteor.users.findOne({username: testUser}); }
    var getTestUserId = function getTestUserId() { return getTestUser()._id };
    var getOtherUser = function getOtherUser() { return Meteor.users.findOne({username: otherUser}); }
    var getOtherUserId = function getOtherUserId() { return getOtherUser()._id; }
    var loginTestUser = function loginTestUser() { this.userId = getTestUserId(); }
    var loginOtherUser = function loginOtherUser() { this.userId = getOtherUserId(); }
    var logout = function logout() { this.userId = null; }
    var thirdUser = 'test_user2';
    var getThirdUser = function() { return Meteor.users.findOne({username: thirdUser}); }
    var getThirdUserId = function() { return getThirdUser()._id; }
    var loginThirdUser = function() { this.userId = getThirdUserId(); }
      
      
    
    var inflateViscosityRating = function inflateViscosityRating(username, rating) { 
      Meteor.users.update({username: username}, {$set: {viscosityEvents: [{type: 'inflated', score: rating, timestamp: new Date(), decays: false}]}});
    }

    var cleanUp = function cleanUp() { 
      removeTestSqueak();
      logout();
      removeViscosityEvents();
    }

    var findTestSqueak = function findTestSqueak() { return Squeaks.findOne({title: testSqueakTitle}); }
    var removeTestSqueak = function removeTestSqueak() { Squeaks.remove({title: testSqueakTitle}); }
    /**
     * Login as the test user, insert the test squeak, and log back out.
     * @return void
     */
    var insertTestSqueak = function insertTestSqueak() { 
      loginTestUser();
      insertSqueak(testSqueak);
      logout();
    }
    /**
     * get rid of the test axle from the Axles collection
     */
    var removeTestAxle = function removeTestAxle() { Axles.remove({name: testAxle}); }
    /**
     * Tag the test squeak to the test axle -- assumes test squeak exists
     */
    var tagTestSqueak = function tagTestSqueak() {
        return tagSqueakToAxle(getTestSqueakId(), testAxle);
    }
    /**
     * Return the test axle
     */
    var findTestAxle = function findTestAxle() { return Axles.findOne({name: testAxle}); }
    /**
     * Remove all squeak workflow related activities
     * @return {void}
     */
    var clearWorkflowActivities = function clearWorkflowActivities() { 
      Activities.remove({type: 'squeakWorkflow'});
      Activities.remove({type: 'workflowMotionInitiated'});
      Activities.remove({type: 'workflowMotionResolved'});
    }
    /** 
     * Remove all of the test user's and the other user's viscosity events
     */
    var removeViscosityEvents = function removeViscosityEvents() { 
      Meteor.users.update({username: testUser}, {$set: {viscosityEvents: [], viscosityAdmin: false}});
      Meteor.users.update({username: otherUser}, {$set: {viscosityEvents: [], viscosityAdmin: false}});
      Meteor.users.update({username: thirdUser}, {$set: {viscosityEvents: [], viscosityAdmin: false}});
    }
    /**
     * Expects the test squeak not to be in there
     * expects the user to be logged out (this.userId = null)
     */
    describe('A Squeak', function() { 
      /**
       * Clear out the test Squeak and the test user
       */
      beforeEach(function() { // before everything let's make sure the Test Squeak DNE
        cleanUp();  
      });
      /**
       * Clear out the test squeak and logout
       */
      afterEach(function() { // Also, after each thing, go ahead and do the same thing.  This seems inefficient...
        cleanUp();
      })

      it('should have a unique title', function() { 
        var test;
        Squeaks.insert({title: testSqueakTitle, description: 'Test'});
        test = function() { Squeaks.insert({title: testSqueakTitle, description: 'Another thing'}); }
        chai.assert.throws(test, 'E11000', /duplicate key/i, 'did not hit a duplicate key error');
        Squeaks.remove({title: 'Test'});
      });

      it('Should have relevant indices', function(){}); // either need direct access to mongo or figure out how to do e.g. Squeaks._getIndexes()
      // Note: https://github.com/mad-eye/meteor-mocha-web/issues/43 cannot create pending tests?
      
      it('Should not be insertable if not logged in', function() { 
        var test = function() { return insertSqueak(testSqueak) };
        expect(test).to.throw('User is not logged in');
      }); // end should not be insertable if not logged in.

      it('Should not be insertable if incomplete', function() {
        var description = 'No-title test Squeak'
        var mySqueak = {description: description};
        var test = function() { insertSqueak(mySqueak); }

        loginTestUser();
        expect(test).to.throw('Match error: Missing key \'title\'');
        logout();
      });

      it('Should be insertable and add viscosity event if logged in and complete', function() { 
        var test = function() { return insertSqueak(testSqueak); }
        var ve;
        loginTestUser();
        expect(test).to.not.throw().and.to.be.a('String');
        expect(findTestSqueak()).to.be.defined;
        ve = getTestUser().viscosityEvents;
        expect(ve).to.have.length(1);
        expect(ve[0].type).to.equal('insertSqueak');

        removeTestSqueak();
        logout();
      });

      it('Should not be editable if user is not logged in', function() {
        var test = function() { return editSqueak(getTestSqueakId(), 'description', 'New test description'); }
        insertTestSqueak();
        expect(test).to.throw('User is not logged in');
        expect(findTestSqueak().description).to.equal(testDescription);
        removeTestSqueak();
        logout();
      }); // end test should not be editable

      it('Should not be editable if logged-in user is not owner', function() { 
        var test = function() { editSqueak(getTestSqueakId(), 'description', 'New test description'); }
        insertTestSqueak();
        loginOtherUser();
        expect(test).to.throw('user is not author');
        expect(findTestSqueak().description).to.equal(testDescription);
        removeTestSqueak();
        logout();
      }); // end should not be editable by non-author

      it('Should not be possible to edit a non-existent field', function() { 
        var test = function() { editSqueak(getTestSqueakId(), 'fakefield', 'New test description'); }
        insertTestSqueak();
        loginTestUser();
        expect(test).to.throw('valid fields to edit');
        removeTestSqueak();
        logout();
      });

      it('should throw a meaningful error if title is not unique', function() { 
        var test = function() { 
          editSqueak(getTestSqueakId(), 'title', 'Reducing your mother\'s weight problem');
        }

        insertTestSqueak();
        loginTestUser();
        expect(test).to.throw('A Squeak with that title already exists');
        removeTestSqueak();
        logout();
      });

      it('Should be editable if logged-in user is owner', function() { 
        var test = function() { 
          editSqueak(getTestSqueakId(), 'description', 'New test description'); 
          editSqueak(getTestSqueakId(), 'reCreation', 'New test reCreation'); 
          editSqueak(getTestSqueakId(), 'target', 'New test target'); 
          return editSqueak(getTestSqueakId(), 'title', 'New test title'); 
        }

        var squeakId;
        var squeak;

        insertTestSqueak();
        squeakId = findTestSqueak()._id;
        loginTestUser();
        expect(test).to.not.throw().and.to.be.true;
        squeak = Squeaks.findOne({_id: squeakId});
        expect(squeak.description).to.equal('New test description');
        expect(squeak.reCreation).to.equal('New test reCreation');
        expect(squeak.target).to.equal('New test target');
        expect(squeak.title).to.equal('New test title');

        // Test that edits generate a notification:
        expect(Activities.find({type: 'squeakEdited', "watched._id": squeakId}).count()).to.equal(4);

        deleteSqueak(squeakId);  // Test that it gets rid of activities...
        expect(Activities.find({type: 'squeakEdited', "watched._id": squeakId}).count()).to.equal(0);        
        logout();
      }); // end it should be editable by the author

      it('Should not be deletable if not logged in', function() {
        var test = function() { deleteSqueak(getTestSqueakId()); }
        insertTestSqueak();
        expect(test).to.throw('User is not logged in');
        expect(findTestSqueak()).to.exist;
        removeTestSqueak();
      }); // end should not be deletable if not logged in

      it('Should not be deletable if logged-in user is not author', function() {
        var test = function() { deleteSqueak(getTestSqueakId()); }
        insertTestSqueak();
        loginOtherUser();
        expect(test).to.throw('user is not author');
        expect(findTestSqueak()).to.exist;
        removeTestSqueak();
        logout();
      });

      it('Should be deletable if logged-in user is author and should generate alerts and decrement tagged axles', function() { 
        var squeak;
        var activity;
        var squeakCount;

        insertTestSqueak();
        squeak = findTestSqueak();

        Activities.remove({}); // get rid of any activities might be hangin' around.
        loginTestUser();
        tagTestSqueak();
        squeakCount = findTestAxle().squeakCount;

        expect(deleteSqueak(getTestSqueakId())).to.exist.and.to.be.true;
        expect(findTestSqueak()).to.not.exist;
        expect(findTestAxle().squeakCount).to.equal(squeakCount - 1);

        activity = Activities.findOne({type: 'watchedSqueakDeleted', 
                                      action: {title: squeak.title, user: this.userId}});
        expect(activity).to.exist;

        // Should have gotten rid of all other activities
        expect(Activities.find().count()).to.equal(1);
        
        Activities.remove({}); // Clean up
        logout();

      }); // end it should be deletable by the author

      it('Should not allow comment creation by not logged-in users', function() { 
        var comments; 
        var test = function() { commentOnSqueak(getTestSqueakId(), 'Test comment'); }
        insertTestSqueak();
        expect(test).to.throw('User is not logged in');
        comments = findTestSqueak().comments;
        comments.should.have.length(0);
        removeTestSqueak();
      }); // end should not allow comment creation if not logged in.

      it('Should allow comment creation by logged-in users and add viscosity event', function() { 
        var comments; 
        var squeak; 
        var ve;
        
        insertTestSqueak();
        loginOtherUser();
        expect(commentOnSqueak(getTestSqueakId(), 'Test comment')).to.be.true;

        ve = getOtherUser().viscosityEvents;
        expect(ve).to.have.length(1);
        expect(ve[0].type).to.equal('commentOnSqueak');

        comments = findTestSqueak().comments;
        comments.should.have.length(1);
        squeak = findTestSqueak();

        // comments should create a notification:
        expect(Activities.find({"watched._id": squeak._id, type: "comment"}).count()).to.equal(1);
        
        // deleting a squeak should remove the notification:
        logout();
        loginTestUser();
        deleteSqueak(squeak._id);
        expect(Activities.find({"watched._id": squeak._id, type: "comment"}).count()).to.equal(0);

        logout();
      }); // end should allow comment creation

      it('Should not be votable by the author', function() { 
        var squeak;
        insertTestSqueak();
        loginTestUser();
        expect(voteForSqueak(getTestSqueakId())).to.be.true;
        squeak = findTestSqueak();
        squeak.votes.should.equal(0);
        squeak.voters.should.have.length(1); // should include author
        removeTestSqueak();
        logout();
      });

       it('Should be votable only once by non-author and award viscosity event', function() { 
        var squeak; 
        var ve; 

        insertTestSqueak();
        loginOtherUser();
        expect(voteForSqueak(getTestSqueakId())).to.be.true;
        squeak = findTestSqueak();
        squeak.votes.should.equal(1);
        squeak.voters.should.have.length(2); // should include author

        ve = getOtherUser().viscosityEvents;
        expect(ve).to.have.length(1);
        expect(ve[0].type).to.equal('voteForSqueak');

        expect(voteForSqueak(getTestSqueakId())).to.be.true;
        squeak = findTestSqueak();
        
        // Should not have updated.
        squeak.votes.should.equal(1);
        squeak.voters.should.have.length(2); // should include author

        // Should not have awarded aditional viscosity
        ve = getTestUser().viscosityEvents;
        expect(ve).to.have.length(1);
      }); // end voting test
    }); // end describe('A squeak');

  /**
     * Every item in this block assumes that the Test Squeak exists with no axles tagged to it prior to running the tests.
     * It also assumes no user is logged in.
     * @return void
     */
    describe('Tagging a Squeak to an Axle', function() { 
      var ensureAxleTestState = function ensureAxleTestState() {
        removeTestSqueak();
        insertTestSqueak();
        removeTestAxle();        
      }

      beforeEach(function() { 
        ensureAxleTestState();  
      });

      afterEach(function() { 
        ensureAxleTestState();
      });

      after(function() { 
        removeTestAxle();
        removeTestSqueak();
        logout();
      });

      it('Should create the Axle if the Axle does not already exist', function() { 
        var axle;
        var squeak;

        loginTestUser();
        expect(tagTestSqueak()).to.be.true;
        axle = findTestAxle();
        expect(axle).to.exist;
        expect(axle._id).to.be.a('string');
        expect(axle.squeakCount).to.equal(1);

        squeak = findTestSqueak();
        squeak.axles.should.have.length(1);
        squeak.axles.should.contain(axle._id);
        removeTestSqueak();
        removeTestAxle();
        logout();
      }); // end it should create the axle
        
      it('Should not be possible by non-author', function() { 
        var axle;
        var squeak;

        
        loginOtherUser();
        expect(tagTestSqueak).to.throw('Only the Squeak author');
        axle = findTestAxle();
        expect(axle).to.be.undefined;
              
        squeak = findTestSqueak();
        squeak.axles.should.have.length(0);
        removeTestSqueak();
        removeTestAxle();
        logout();
      });
    }); // end describe tagging

    /**
     * Assumes the Test Squeak exists, the Test Axle is tagged to it, and user is logged out.
     */
    describe('Removing a Squeak from an Axle', function() { 
      var ensureAxleDeleteState = function ensureAxleDeleteState() {
        removeTestSqueak();
        removeTestAxle();
        insertTestSqueak();
        loginTestUser();
        tagTestSqueak();
        logout();
      }

      beforeEach(function() { 
        ensureAxleDeleteState();  
      }); // end beforeEach

      afterEach(function() { 
        ensureAxleDeleteState();  
      }); // end afterEach
      /**
       * Login, kill the test squeak, kill the test axle, and log out.
       */
      after(function() { 
        removeTestSqueak();
        removeTestAxle();
        logout();
      }); // end After

      it('Should be possible by author', function() { 
        var squeak;
        var axle; 

        loginTestUser();
        expect(removeSqueakFromAxle(getTestSqueakId(), testAxle)).to.be.true;
        squeak = findTestSqueak();
        expect(squeak.axles).to.have.length(0);
        axle = findTestAxle();
        expect(axle.squeakCount).to.equal(0);
        tagTestSqueak(); // restore this.
        logout();
      }); // end should be possible by author

      it('Should not be possible by non-author', function() { 
        var squeak;
        var axle; 

        loginOtherUser();
        var test = function() { removeSqueakFromAxle(getTestSqueakId(), testAxle); }
        expect(test).to.throw('Only the Squeak author');
        squeak = findTestSqueak();
        expect(squeak.axles).to.have.length(1);

        axle = findTestAxle();
        expect(axle.squeakCount).to.equal(1);
        
        logout();
      });
            
    }); // end describe removing a squeak from an axle
    /**
     * Assumes the Test Squeak exists, no watchers have been added, and the user is logged out.
     */
    describe('Watching a Squeak', function() { 
      var ensureWatchingState = function ensureWatchingState() {
        removeTestSqueak();
        insertTestSqueak();
        logout();
      }

      beforeEach(function() { 
        ensureWatchingState();  
      }); // end beforeEach

      afterEach(function() { 
        ensureWatchingState();  
      }); // end afterEach

      after(function() {
        removeTestSqueak();
        logout();
      });

      it("Should, by default, be watched by the author", function() { 
        var watchers = findTestSqueak().watchers;
        expect(watchers).to.have.length(1);
        expect(watchers).to.include(getTestUserId());
      });

      it("Should not be possible to try to watch or unwatch a Squeak if not logged in", function() { 
        var test = function test() { watchSqueak(getTestSqueakId()); }
        expect(test).to.throw('User is not logged in');

        test = function test() { unwatchSqueak(getTestSqueakId()); }
        expect(test).to.throw('User is not logged in');
      });

      it("Should error if a bogus Squeak is submitted", function() { 
        loginTestUser();
        var test = function test() { watchSqueak("Bogus_Squeak_Id"); }
        expect(test).to.throw('No such Squeak');

        test = function test() { unwatchSqueak("Bogus_Squeak_Id"); }
        expect(test).to.throw('No such Squeak');
        logout();
      });

      it("Should be possible to subscribe and unsubscribe from Squeaks", function() { 
        var watchers;

        loginOtherUser();
        expect(watchSqueak(getTestSqueakId())).to.be.true;
        
        watchers = findTestSqueak().watchers;
        expect(watchers).to.have.length(2);
        expect(watchers).to.include(getOtherUserId());

        expect(unwatchSqueak(getTestSqueakId())).to.be.true;

        watchers = findTestSqueak().watchers;
        expect(watchers).to.have.length(1);
        expect(watchers).to.not.include(getOtherUserId());

        logout();
      });
    }); // end describe watching
    /**
     * Assumes no user is logged in, the test Squeak exists in the Squeaky state, no activities exist, and no users have any VR.
     */
    describe('Squeak workflow motion initiation', function() { 
      beforeEach(function() { 
        removeTestSqueak();
        insertTestSqueak();
        Activities.remove({}); // clear the activities from having created the test squeak
        removeViscosityEvents(); // clear the events from having created the test squeak
        logout();
      });

      after(function() { 
        Activities.remove({});
        removeTestSqueak();
        removeViscosityEvents();
        logout();
      });

      it("Should not be possible for a non-logged-in user", function() { 
        var test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected'}); }
        expect(test).to.throw('User is not logged in');
      });

      it("Should reject bogus proposals", function() { 
        var test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'bouncy'}); }
        loginTestUser();
        expect(test).to.throw('proposedState must be one of');
      });

      it("Should not be possible to move to open a Squeak that's already open", function() { 
        var test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Squeaky'}); }
        loginTestUser();
        expect(test).to.throw('Cannot move to re-open a Squeak');
      });

      it("Should not be possible to move to close a Squeak that's already closed", function() { 
        var test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased'}); }
        loginTestUser();
        Squeaks.update({title: testSqueakTitle}, {$set: {state: 'Greased'}});
        expect(test).to.throw('Cannot move to reject or grease a Squeak');

        test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected'}); }
        expect(test).to.throw('Cannot move to reject or grease a Squeak');

        Squeaks.update({title: testSqueakTitle}, {$set: {state: 'Rejected'}});
        expect(test).to.throw('Cannot move to reject or grease a Squeak');

        test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased'}); }
        expect(test).to.throw('Cannot move to reject or grease a Squeak');
      });

      it("Should require a comment", function() { 
        var test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased'}); }
        loginTestUser();
        expect(test).to.throw('You must provide a comment');
      });

      it("Should require a reason if the Squeak is being rejected", function() { 
        var test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test'}); }
        loginTestUser();
        expect(test).to.throw('Reason must be one of');
      });

      it("Should reject bogus reasons if the Squeak is being rejected", function() { 
        var test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'I feel like it'}); }
        loginTestUser();
        expect(test).to.throw('Reason must be one of');
      });

      it("Should not be possible for non-author to withdraw the Squeak", function() { 
        var test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Withdrawn'}); }
        loginOtherUser();
        expect(test).to.throw('Only the author');
      });

      it("Should not be possible for a user with < 100 viscosity rating to initiate a close or re-open motion", function() { 
        var test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Duplicate'}); }
        loginTestUser();
        expect(test).to.throw('Users with a Viscosity Rating');

        Squeaks.update({_id: getTestSqueakId()}, {$set: {state: 'Greased'}});
        test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Squeaky', comment: 'test'}); }
        expect(test).to.throw('Users with a Viscosity Rating');
      });

      it("Should not be possible to create multiple open motions of the same type", function() { 
        Squeaks.update({title: testSqueakTitle}, {$set: {motions: [{proposedState: 'Greased', state: 'Open'}]}});
        var test = function() { initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'}); }
        loginTestUser();
        expect(test).to.throw('There is already a proposal');
      });

      it("Should be possible for any user to submit a proposal, should add viscosity event and activity and change Squeak state", function() { 
        var test = function() { return initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'}); }
        var squeak;
        var motion; 
        var ve;
        var activity;

        loginOtherUser();
        expect(test()).to.be.true;

        squeak = findTestSqueak();
        expect(squeak.motions).to.have.length(1);
        expect(squeak.state).to.equal('Under inspection');
        motion = squeak.motions[0];
        expect(motion.proposedState).to.equal('Greased');
        expect(motion.comment).to.equal('test');
        expect(motion.user).to.equal(getOtherUserId());
        expect(motion.state).to.equal('Open');
        expect(motion.score).to.equal(0);
        expect(motion.comments).to.have.length(0);
        expect(motion.voters).to.have.length(1);
        expect(motion.voters[0].userId).to.equal(getOtherUserId());
        expect(motion.voters[0].isFor).to.be.true;
        expect(motion.resolved).to.be.null;

        ve = getOtherUser().viscosityEvents;
        expect(ve).to.have.length(1); // no inflation
        expect(ve[0].type).to.equal('proposeSqueakSolution');

        activity = Activities.findOne({type: 'workflowMotionInitiated'});
        expect(activity).to.exist;
        expect(activity.action._id).to.equal(motion._id);
        expect(activity.users).to.have.length(1); // should only be watchers
        expect(activity.users[0].userId).to.equal(getTestUserId());
        expect(activity.watched._id).to.equal(getTestSqueakId());

        logout();
        loginTestUser();
        deleteSqueak(squeak._id);
        expect(Activities.findOne({type: 'workflowMotionInitiated'})).to.be.undefined;
      });

      // I only broke this out so I didn't have to re-use the beforeEach code.
      it("Should do the same for motions to close for users with VR > 100", function() { 
        var test = function() { return initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Offensive'}); }
        var squeak;
        var motion; 
        var ve;
        var activity;

        inflateViscosityRating(otherUser, 100);
        loginOtherUser();
        expect(test()).to.be.true;

        squeak = findTestSqueak();
        expect(squeak.motions).to.have.length(1);
        motion = squeak.motions[0];
        expect(motion.proposedState).to.equal('Rejected');
        expect(motion.reason).to.equal('Offensive');
        expect(motion.comment).to.equal('test');
        expect(motion.user).to.equal(getOtherUserId());
        expect(motion.state).to.equal('Open');
        expect(motion.score).to.equal(100);
        expect(motion.comments).to.have.length(0);
        expect(motion.voters).to.have.length(1);
        expect(motion.voters[0].userId).to.equal(getOtherUserId());
        expect(motion.voters[0].isFor).to.be.true;
        expect(motion.resolved).to.be.null;


        ve = getOtherUser().viscosityEvents;
        expect(ve).to.have.length(2); // should include the one we used to inflate!
        expect(ve[1].type).to.equal('moveToClose');

        activity = Activities.findOne({type: 'workflowMotionInitiated'});
        expect(activity).to.exist;
        expect(activity.action._id).to.equal(motion._id);
        expect(activity.users).to.have.length(1); // should only be watchers
        expect(activity.users[0].userId).to.equal(getTestUserId());
        expect(activity.watched._id).to.equal(getTestSqueakId());
      });

      it("Should be possible to re-open a Squeak", function() { 
        var squeak;

        Squeaks.update({_id: getTestSqueakId()}, {$set: {state: 'Greased'}});
        loginTestUser();
        inflateViscosityRating(testUser, 1001);
        expect(initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Squeaky', comment: 'test'})).to.be.true;

        squeak = findTestSqueak();
        expect(squeak.motions).to.have.length(1);
        expect(squeak.state).to.equal('Squeaky');
      });

      it("Should be possible to have multiple open motions of different types", function() { 
        var squeak;
        var motion;
        
        inflateViscosityRating(otherUser, 100);
        loginOtherUser();
        expect(initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'})).to.be.true;
        expect(initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Offensive'})).to.be.true;

        squeak = findTestSqueak();
        expect(squeak.motions).to.have.length(2);
        motion = squeak.motions[0];
        expect(motion.proposedState).to.equal('Greased');
        expect(motion.state).to.equal('Open');
        
        motion = squeak.motions[1];
        expect(motion.proposedState).to.equal('Rejected');
        expect(motion.state).to.equal('Open');

        ve = getOtherUser().viscosityEvents;
        expect(ve).to.have.length(3); // includes the one we used to inflate!
        
        expect(Activities.find({type: 'workflowMotionInitiated'}).count()).to.equal(2);
      });
    }); // end describe squeak workflow motion initiation
    /**
     * Assumes Squeak exists, users logged out, no VE, no VR, no activities
     */
    describe("Squeak Workflow motion resolution", function() { 
      beforeEach(function() { 
        Activities.remove({});
        removeTestSqueak();
        removeViscosityEvents();
        insertTestSqueak();
        logout();
      });

      after(function() { 
        Activities.remove({});
        removeTestSqueak();
        removeViscosityEvents();
        logout();
      });

      it("Should be possible for any user to vote on a motion, contribute that user's VR, and should award VE", function() { 
        var squeak;
        var motion;
        var ve;

        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'});
        squeak = findTestSqueak();

        logout();
        inflateViscosityRating(testUser, 50);
        loginTestUser();
        voteOnMotion(squeak.motions[0]._id, true);
        squeak = findTestSqueak();
        motion = squeak.motions[0];

        expect(motion.score).to.equal(150);
        expect(motion.state).to.equal('Open');

        ve = getTestUser().viscosityEvents;
        expect(ve).to.have.length(2); // includes the inflation
        expect(ve[1].type).to.equal('voteOnMotion');
      });

      it("Should allow negative voting", function() { 
        var squeak;
        var motion;
        var ve;

        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'});
        squeak = findTestSqueak();

        logout();
        inflateViscosityRating(testUser, 50);
        loginTestUser();
        voteOnMotion(squeak.motions[0]._id, false);
        squeak = findTestSqueak();
        motion = squeak.motions[0];

        expect(motion.score).to.equal(50);
        expect(motion.state).to.equal('Open');

        ve = getTestUser().viscosityEvents;
        expect(ve).to.have.length(2); // includes the inflation event
        expect(ve[1].type).to.equal('voteOnMotion');
      });

      it("Should not be possible for the motion author to vote or a user to vote more than once", function() { 
        var test = function() { voteOnMotion(findTestSqueak().motions[0]._id, true); }
        var squeak;
        var motion;
        var ve;
        
        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'});
        
        expect(test).to.throw('Cannot vote for the same motion twice');
        expect(findTestSqueak().motions[0].score).to.equal(100); // shouldn't have udpated the score
        
        logout();
        inflateViscosityRating(testUser, 50);
        loginTestUser();
        voteOnMotion(findTestSqueak().motions[0]._id, true);
        expect(test).to.throw('Cannot vote for the same motion twice');
        squeak = findTestSqueak();
        motion = squeak.motions[0];

        expect(motion.score).to.equal(150);
        expect(motion.state).to.equal('Open');
      });

      it("Should not be possible to vote on a closed motion", function() { 
        var test = function() { voteOnMotion(findTestSqueak().motions[0]._id, true); }
        Squeaks.update({title: testSqueakTitle}, {$set: {motions: [{_id: 'testId', state: 'Accepted'}]}})
        loginOtherUser();
        expect(test).to.throw("Cannot vote on a closed motion");
      });

      it("Should not be possible to resolve a closed motion", function() { 
        var test = function() { resolveMotion(findTestSqueak().motions[0]._id, true); }
        Squeaks.update({title: testSqueakTitle}, {$set: {motions: [{_id: 'testId', state: 'Accepted'}]}});
        loginOtherUser();
        expect(test).to.throw("motion is already resolved");
      });

      it("Should not be possible for non-motion-author to resolve if voting does not warrant it", function() { 
        var test = function() { resolveMotion(findTestSqueak().motions[0]._id, true); }
        Squeaks.update({title: testSqueakTitle}, {$set: {motions: [{_id: 'testId', state: 'Open', user: getTestUserId(), score: 100}]}});
        loginOtherUser();
        expect(test).to.throw("the user who initiated the motion can withdraw his own motion");
      });

      it("Should resolve a proposed solution favorably if the motion's score goes above 1000, change Squeak state, add activities, and award necessary VE", function() { 
        var squeak;
        var motion;
        var ve;
        var activity;

        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'});
        
        logout();

        loginThirdUser();
        expect(getThirdUser().viscosityEvents).to.have.length(0);
        voteOnMotion(findTestSqueak().motions[0]._id, false); // vote against to test the viscosity events
        
        logout();

        inflateViscosityRating(testUser, 901);
        loginTestUser();
        voteOnMotion(findTestSqueak().motions[0]._id, true);
        
        squeak = findTestSqueak();
        motion = squeak.motions[0];

        expect(motion.score).to.equal(1001);
        expect(motion.state).to.equal('Accepted');
        expect(squeak.state).to.equal('Greased');
        expect(motion.resolved).to.be.greaterThan(motion.created);

        ve = getTestUser().viscosityEvents;
        expect(ve).to.have.length(4); // includes the inflation
        expect(ve[2].type).to.equal('votedCorrectly');
        expect(ve[3].type).to.equal('squeakResolved');

        ve = getOtherUser().viscosityEvents;
        expect(ve).to.have.length(3); // includes the inflation
        expect(ve[2].type).to.equal('resolutionPassed');

        ve = getThirdUser().viscosityEvents;
        expect(ve).to.have.length(2); // he hasn't been inflated
        expect(ve[1].type).to.equal('votedIncorrectly');

        var activity = Activities.findOne({type: 'workflowMotionResolved'});
        expect(activity.action._id).to.equal(motion._id);
        expect(activity.watched._id).to.equal(squeak._id);

        Squeaks.update({_id: squeak._id}, {$set: {state: 'Squeaky'}});
        deleteSqueak(squeak._id);
        expect(Activities.findOne({type: 'workflowMotionResolved'})).to.be.undefined;
      });

      it("Should resolve a motion to close favorably if the motion's score goes above 1000, change Squeak state, add activities, and award necessary VE", function() { 
        var squeak;
        var motion;
        var ve;
        var activity;

        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Unproductive'});
        
        logout();

        loginThirdUser();
        voteOnMotion(findTestSqueak().motions[0]._id, false); // vote against to test the viscosity events
        logout();

        inflateViscosityRating(testUser, 901);
        loginTestUser();
        voteOnMotion(findTestSqueak().motions[0]._id, true);
        squeak = findTestSqueak();
        motion = squeak.motions[0];

        expect(motion.score).to.equal(1001);
        expect(motion.state).to.equal('Accepted');
        expect(squeak.state).to.equal('Rejected');

        ve = getTestUser().viscosityEvents;
        expect(ve).to.have.length(4); // includes the inflation
        expect(ve[2].type).to.equal('votedCorrectly');
        expect(ve[3].type).to.equal('squeakRejected');

        ve = getOtherUser().viscosityEvents;
        expect(ve).to.have.length(3); // includes the inflation
        expect(ve[2].type).to.equal('motionPassed');

        ve = getThirdUser().viscosityEvents;
        expect(ve).to.have.length(2); // he hasn't been inflated
        expect(ve[1].type).to.equal('votedIncorrectly');

        var activity = Activities.findOne({type: 'workflowMotionResolved'});
        expect(activity.action._id).to.equal(motion._id);
        expect(activity.watched._id).to.equal(squeak._id);
      });

      it("Should reject a proposal if the proposal's score goes below -1000, no state change, activities and award necessary VE", function() { 
        var squeak;
        var motion;
        var ve;
        var activity;

        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'});
        
        logout();

        loginThirdUser();
        voteOnMotion(findTestSqueak().motions[0]._id, true); // vote for to test the viscosity events
        logout();

        inflateViscosityRating(testUser, 1101);
        loginTestUser();
        voteOnMotion(findTestSqueak().motions[0]._id, false);
        squeak = findTestSqueak();
        motion = squeak.motions[0];

        expect(motion.score).to.equal(-1001);
        expect(motion.state).to.equal('Rejected');
        expect(motion.resolved).to.be.greaterThan(motion.created);
        expect(squeak.state).to.equal('Squeaky');

        ve = getTestUser().viscosityEvents;
        expect(ve).to.have.length(3); // includes the inflation
        expect(ve[2].type).to.equal('votedCorrectly');
        
        ve = getOtherUser().viscosityEvents;
        expect(ve).to.have.length(3); // includes the inflation
        expect(ve[2].type).to.equal('resolutionRejected');

        ve = getThirdUser().viscosityEvents;
        expect(ve).to.have.length(2); // he hasn't been inflated
        expect(ve[1].type).to.equal('votedIncorrectly');

        var activity = Activities.findOne({type: 'workflowMotionResolved'});
        expect(activity.action._id).to.equal(motion._id);
        expect(activity.watched._id).to.equal(squeak._id);
      });

      it("Should reject a motion if the motion's score goes below -1000, no state change, activities and award necessary VE", function() { 
        var squeak;
        var motion;
        var ve;
        var activity;

        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Duplicate'});
        
        logout();

        loginThirdUser();
        voteOnMotion(findTestSqueak().motions[0]._id, true); // vote for to test the viscosity events
        logout();

        inflateViscosityRating(testUser, 1101);
        loginTestUser();
        voteOnMotion(findTestSqueak().motions[0]._id, false);
        squeak = findTestSqueak();
        motion = squeak.motions[0];

        expect(motion.score).to.equal(-1001);
        expect(motion.state).to.equal('Rejected');
        expect(motion.resolved).to.be.greaterThan(motion.created);
        expect(squeak.state).to.equal('Squeaky');

        ve = getTestUser().viscosityEvents;
        expect(ve).to.have.length(3); // includes the inflation
        expect(ve[2].type).to.equal('votedCorrectly');
        
        ve = getOtherUser().viscosityEvents;
        expect(ve).to.have.length(3); // includes the inflation
        expect(ve[2].type).to.equal('motionRejected');

        ve = getThirdUser().viscosityEvents;
        expect(ve).to.have.length(2); // he hasn't been inflated
        expect(ve[1].type).to.equal('votedIncorrectly');

        var activity = Activities.findOne({type: 'workflowMotionResolved'});
        expect(activity.action._id).to.equal(motion._id);
        expect(activity.watched._id).to.equal(squeak._id);
      });

      it("Should be possible for the squeak author to automatically accept a proposal to resolve", function() { 
        var squeak;
        var motion;

        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'});
        logout();

        loginTestUser();
        resolveMotion(findTestSqueak().motions[0]._id, true);
        squeak = findTestSqueak();
        motion = squeak.motions[0];
        expect(motion.state).to.equal('Accepted');
        expect(motion.score).to.equal(100); // shouldn't have updated the score
        expect(squeak.state).to.equal('Greased');
      });

      it("Should be possible for the squeak author to reject a proposed solution", function() { 
        var squeak;
        var motion;

        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'});
        logout();

        loginTestUser();
        resolveMotion(findTestSqueak().motions[0]._id, false);
        squeak = findTestSqueak();
        motion = squeak.motions[0];
        expect(motion.state).to.equal('Rejected');
        expect(motion.score).to.equal(100); // shouldn't have updated the score
        expect(squeak.state).to.equal('Squeaky');
      });

      it("Should not be possible for the squeak author to automatically reject a proposal to close", function() { 
        var squeak;
        var motion;
        var test = function() { resolveMotion(findTestSqueak().motions[0]._id, false); }

        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Duplicate'});
        logout();

        loginTestUser();
        expect(test).to.throw("can accept or reject a solution");
        squeak = findTestSqueak();
        motion = squeak.motions[0];
        expect(motion.state).to.equal('Open');
        expect(motion.score).to.equal(100); // shouldn't have updated the score
      });

      it("Should be possible for the initiating user to reject his or her own proposal", function() { 
        var squeak;
        var motion;
        var test = function() { resolveMotion(findTestSqueak().motions[0]._id, false); }

        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Duplicate'});
        expect(resolveMotion(findTestSqueak().motions[0]._id, false)).to.be.true;
        squeak = findTestSqueak();
        motion = squeak.motions[0];
        expect(motion.state).to.equal('Rejected');
        expect(motion.score).to.equal(100);
        expect(squeak.state).to.equal('Squeaky');
      });

      it("Should be possible for the squeak author to withdraw a Squeak without calling for a motion", function() { 
        var squeak;
        var motion;

        loginTestUser();
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Withdrawn'});

        squeak = findTestSqueak();
        expect(squeak.state).to.equal('Rejected');
        motion = squeak.motions;
        expect(motion).to.have.length(1);
        expect(motion[0].state).to.equal('Accepted');
      });

      it("Should automatically resolve a motion if the initiating user has > 1000 VR", function() { 
        var squeak;
        var motion;
        var test = function() { resolveMotion(findTestSqueak().motions[0]._id, false); }

        loginOtherUser();
        inflateViscosityRating(otherUser, 1000);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Duplicate'});
        squeak = findTestSqueak();
        motion = squeak.motions[0];
        expect(motion.state).to.equal('Accepted');
        expect(motion.score).to.equal(1000);
        expect(squeak.state).to.equal('Rejected');
      });

      it("Should resolve all open motions if a motion passes", function() { 
        var squeak;
        var motion;
        
        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Duplicate'});
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'});
        logout();

        loginThirdUser();
        inflateViscosityRating(thirdUser, 901);
        voteOnMotion(findTestSqueak().motions[1]._id, true);

        logout();

        squeak = findTestSqueak();
        motion = squeak.motions[0];
        expect(squeak.state).to.equal('Greased');
        expect(motion.state).to.equal('Rejected');
        expect(motion.score).to.equal(100);
        
        motion = squeak.motions[1];
        expect(motion.state).to.equal('Accepted');
        expect(motion.score).to.equal(1011); // it's 100 + 10 for having already proposed a solution + 901 from user3
      });

      it("Should not resolve other open notifications if the resolution does not pass", function() { 
        var squeak;
        var motion;
        
        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Rejected', comment: 'test', reason: 'Duplicate'});
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'});
        logout();

        loginThirdUser();
        inflateViscosityRating(thirdUser, 1111);
        voteOnMotion(findTestSqueak().motions[1]._id, false);

        logout();

        squeak = findTestSqueak();
        motion = squeak.motions[0];
        expect(squeak.state).to.equal('Under inspection'); // If there's ANY open resolutions, it should keep it as UI
        expect(motion.state).to.equal('Open');
        expect(motion.score).to.equal(100);
        
        motion = squeak.motions[1];
        expect(motion.state).to.equal('Rejected');
        expect(motion.score).to.equal(-1001); // it's 100 + 10 for having already proposed a solution - 1111 from user3
      });

      it("Should revert the Squeak to the previous state if the resolution does not pass", function() { 
        var squeakId = getTestSqueakId();; 
        
        loginTestUser();
        inflateViscosityRating(testUser, 100);
        initiateSqueakMotion(squeakId, {proposedState: 'Rejected', comment: 'test', reason: 'Duplicate'});
        resolveMotion(findTestSqueak().motions[0]._id, false);
        expect(findTestSqueak().state).to.equal('Squeaky');

        initiateSqueakMotion(squeakId, {proposedState: 'Greased', comment: 'test'});
        resolveMotion(findTestSqueak().motions[1]._id, false);
        expect(findTestSqueak().state).to.equal('Squeaky');        

        Squeaks.update({_id: squeakId}, {$set: {state: 'Greased'}});
        initiateSqueakMotion(squeakId, {proposedState: 'Squeaky', comment: 'test'});
        resolveMotion(findTestSqueak().motions[2]._id, false);
        expect(findTestSqueak().state).to.equal('Greased');                

        Squeaks.update({_id: squeakId}, {$set: {state: 'Rejected'}});
        initiateSqueakMotion(squeakId, {proposedState: 'Squeaky', comment: 'test'});
        resolveMotion(findTestSqueak().motions[3]._id, false);
        expect(findTestSqueak().state).to.equal('Rejected');                
      });
    }); // end describe squeak workflow motion resolution
    /** 
     * Expects no logged in user, the test Squeak to exist, users to have zero VR, no activities, and there to be one open motion.
     */
    describe("Workflow discussion", function() { 
      beforeEach(function() { 
        removeTestSqueak();
        insertTestSqueak();
        loginOtherUser();
        inflateViscosityRating(otherUser, 100);
        initiateSqueakMotion(getTestSqueakId(), {proposedState: 'Greased', comment: 'test'});
        Activities.remove({});
        removeViscosityEvents();
        logout();
      });

      after(function() { 
        Activities.remove({});
        removeTestSqueak();
        removeViscosityEvents();
        logout();
      });

      it("Should not be possible to comment on a resolved motion", function() { 
        var squeak = findTestSqueak();
        var test = function() { commentOnMotion(squeak.motions[0]._id, "Test"); }
        loginTestUser();
        resolveMotion(squeak.motions[0]._id, false);
        logout();
        loginOtherUser();
        expect(test).to.throw("Cannot comment on resolved motion");
      });

      it("Should require the user to submit a non-empty comment", function() { 
        var squeak = findTestSqueak();
        var test = function() { commentOnMotion(squeak.motions[0]._id, "  "); }
        loginOtherUser();
        expect(test).to.throw("Comment cannot be empty!");
      });

      it("Should not be possible for a logged-out user to comment on an open motion", function() { 
        var squeak = findTestSqueak();
        var test = function() { commentOnMotion(squeak.motions[0]._id, "Test"); }
        expect(test).to.throw("User is not logged in");
      });      

      it("Should be possible for any logged-in user to comment on an open motion and should provide notifications and VR points", function() { 
        var squeak = findTestSqueak();
        var motion;
        var comment;
        var activity;
        var ve;

        loginOtherUser();
        expect(commentOnMotion(squeak.motions[0]._id, "Test comment")).to.be.true;

        motion = findTestSqueak().motions[0];
        expect(motion.comments).to.have.length(1);

        comment = motion.comments[0];
        expect(comment.author).to.equal(getOtherUserId());
        expect(comment.comment).to.equal('Test comment');

        expect(Activities.find({type: 'workflowMotionComment'}).count()).to.equal(1);
        activity = Activities.findOne({type: 'workflowMotionComment'});
        expect(activity.action._id).to.equal(comment._id);
        expect(activity.action.motionId).to.equal(motion._id);
        expect(activity.watched._id).to.equal(squeak._id);

        ve = getOtherUser().viscosityEvents;
        expect(ve).to.have.length(1);
        expect(ve[0].type).to.equal('commentOnSqueak');

        logout();
        loginTestUser();
        deleteSqueak(squeak._id);
        expect(Activities.findOne({type: 'workflowMotionComment'})).to.be.undefined;
      });      
    });
  }); // end testOnly
}