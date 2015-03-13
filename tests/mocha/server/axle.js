if (!(typeof MochaWeb === 'undefined') && true) { 
  MochaWeb.testOnly(function() {
    /**
     * Set up a couple of useful functions
     */
    var expect = chai.expect;
    var should = chai.should();
    var testAxle = 'Rose';
    var testSqueak = {title: 'Test Squeak', 
      description: 'Test description', 
      reCreation: 'Cannot be reCreation',
      target: 'All you kids out therein radioland'
    };
    
    var loginTestUser = function loginTestUser() { this.userId = Meteor.users.findOne({username: 'test_user'})._id; }
    var loginOtherUser = function loginOtherUser() { this.userId = Meteor.users.findOne({username: 'test_user1'})._id; }
    var logout = function logout() { this.userId = null; }
    var killTestAxle = function killTestAxle() { Axles.remove({name: testAxle}); }
    var killTestSqueak = function killTestSqueak() { Squeaks.remove({title: testSqueak.title}); }
    var pullTestSqueakId = function pullTestSqueakId() { return Squeaks.findOne({title: testSqueak.title})._id; }
    var findTestAxle = function findTestAxle() { return Axles.findOne({name: testAxle}); }
    /**
     * Expects the axle to not exist and ** certainly ** not be tagged to any Squeaks.
     * Expects the test Squeak to not exist and the user to be 'logged out'.
     */
    describe('Axles', function() { 
      var testBaseState = function testBaseState() { 
        killTestAxle();
        killTestSqueak();
        logout();
      }
      beforeEach(function() { 
        killTestAxle();
      });

      afterEach(function() { 
        killTestAxle();
      });

      it('Should be unique on name', function() { 
        var insertion = function() { Axles.insert({name: testAxle}); }
        insertion.should.not.throw().and.be.a('string');
        insertion.should.throw('duplicate key error');
      });

      it('createAxle should return ID (even if already created)', function() { 
        var insertion = function() { return createAxle(testAxle); }
        var axleId = insertion();
        expect(axleId).to.be.a('String');

        var axle = Axles.findOne({_id: axleId});
        expect(axle).to.exist.and.to.have.property('name');
        expect(axle.name).to.equal(testAxle);
        expect(insertion).to.not.throw().and.to.equal(axleId);
      });
    }); // end describe axles
    /**
     * Assumes the test axle is created, no one is watching, no user is logged in, and the test squeak does not exist
     */
    describe('Watching axles', function() { 
      var axleWatchingCleanup = function axleWatchingCleanup() { 
        var testId = createAxle(testAxle);
        Axles.update({_id: testId}, {$set: {watchers: []}});
        killTestSqueak();
        logout();
      }

      beforeEach(function() { 
        axleWatchingCleanup();
      });

      afterEach(function() { 
        axleWatchingCleanup();
      });

      after(function() { 
        killTestAxle(); 
        killTestSqueak();
        logout();
      });

      it('Should be possible to watch if the user is logged in', function() { 
        loginTestUser();
        expect(watchAxle(findTestAxle()._id)).to.be.true;
        expect(findTestAxle().watchers).to.contain(this.userId);
        logout();
      });

      it('Should not be possible to watch if the user is not logged in or the axle doesn\'t exist', function() { 
        var test = function() { return watchAxle(findTestAxle()._id); }
        expect(test).to.throw('User is not logged in');
        expect(findTestAxle().watchers).to.have.length(0);

        test = function() { return watchAxle('fakeaxleid'); }
        loginTestUser();
        expect(test).to.throw('No such Axle');
        logout();
      });

      it('Should be possible to un-watch if the logged-in user is watching', function() { 
        loginTestUser();
        watchAxle(findTestAxle()._id);

        expect(unwatchAxle(findTestAxle()._id)).to.be.true;
        expect(findTestAxle().watchers).to.not.contain(this.userId);
        logout();
      });

      it('Should not be possible to un-watch if the user is not logged in or the axle doesn\'t exist', function() { 
        var test = function() { return unwatchAxle(findTestAxle()._id); }
        expect(test).to.throw('User is not logged in');
        expect(findTestAxle().watchers).to.have.length(0);

        test = function() { return unwatchAxle('fakeaxleid'); }
        loginTestUser();
        expect(test).to.throw('No such Axle');
        logout();
      });

      it('Should generate an alert when a Squeak is tagged to that axle', function() { 
        var axle = findTestAxle();
        var squeakId;
        var activity; 

        loginTestUser();
        watchAxle(axle._id);
        squeakId = insertSqueak(testSqueak);
        tagSqueakToAxle(squeakId, axle.name);

        activity = Activities.findOne({'action._id': squeakId, 'action.user': this.userId, type: 'squeakTaggedToAxle'});
        expect(activity).to.exist;
        expect(activity.users).to.have.length(1);
        expect(activity.users[0]).to.deep.equal({userId: this.userId, ack: true});
        killTestSqueak();
        unwatchAxle(axle._id);
      });

      it('Should generate an alert when a Squeak is untagged from that axle', function() { 
        var axle = findTestAxle();
        var squeakId;
        var activity; 

        loginTestUser();
        squeakId = insertSqueak(testSqueak);
        tagSqueakToAxle(squeakId, axle.name);
        watchAxle(axle._id);
        removeSqueakFromAxle(squeakId, axle.name);

        activity = Activities.findOne({'action._id': squeakId, 'action.user': this.userId, type: 'squeakRemovedFromAxle'});
        expect(activity).to.exist;
        expect(activity.users).to.have.length(1);
        expect(activity.users[0]).to.deep.equal({userId: this.userId, ack: true});
        killTestSqueak();
        unwatchAxle(axle._id);
        logout();
      });

      it('Should generate an alert when a Squeak tagged to that axle is deleted, *only* for those watchers not watching the Squeak ', 
        function() { 
          var axle = findTestAxle();
          var otherUserId;
          var squeakId;
          var activity;

          loginTestUser();
          squeakId = insertSqueak(testSqueak); // now he's signed up to watch that Squeak.
          tagSqueakToAxle(squeakId, axle.name);
          logout();

          loginOtherUser(); // now we'll have him watch the Axle.
          otherUserId = this.userId;
          watchAxle(axle._id);
          logout();

          loginTestUser();
          deleteSqueak(squeakId);

          activity = Activities.findOne({action: {title: testSqueak.title, user: this.userId}, type: 'squeakDeletedFromAxle'});
          expect(activity).to.exist;
          expect(activity.users).to.have.length(1);
          expect(activity.users[0]).to.deep.equal({userId: otherUserId, ack: false});
          
          logout(); // lazy cleanup in before / after.
      });
    }); // end describe watching axles
    /**
     * Assume that the axle exists and is tagged to the Test Squeak.  Assume no user is logged in.
     */
    describe('Deleting axles', function() { 
      var axleDeletionTestState = function axleDeletionTestState() { 
        loginTestUser();
        killTestSqueak();
        
        insertSqueak(testSqueak);
        tagSqueakToAxle(pullTestSqueakId(), testAxle);
        logout();
      }
        
      /**
       * Login, create the test axle and tag it.
       */
      beforeEach(function() { 
        axleDeletionTestState();
      });

      afterEach(function() { 
        axleDeletionTestState();
      });

      after(function() { 
        killTestSqueak();
        killTestAxle();
        logout();  
      }); 
      
      it('Should not work if an Axle contains Squeaks', function() { 
        var axle;
        var test = function() { deleteAxle(testAxle); }
        
        loginTestUser();
        expect(test).to.throw('contains Squeaks');
        axle = findTestAxle();
        expect(axle).to.exist;
        logout();
      }); // shouldn't work if contains squeaks

      it('Should work if the axle does not contain Squeaks', function() { 
        var axle;

        loginTestUser();
        removeSqueakFromAxle(pullTestSqueakId(), testAxle);
        expect(deleteAxle(testAxle)).to.be.true;
        axle = findTestAxle();
        expect(axle).to.be.undefined;
      }); // end it should work
    }); // end describe client deletion 
  }); // end mochaweb .testonly
}
