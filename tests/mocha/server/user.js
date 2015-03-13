if (!(typeof MochaWeb === 'undefined') && true) {
  MochaWeb.testOnly(function() {
    var expect = chai.expect;
    var should = chai.should();
    var testUser = 'test_user';
    var otherUser = 'test_user1';
    var loginTestUser = function loginTestUser() { this.userId = Meteor.users.findOne({username: testUser})._id; }
    var logout = function logout() { this.userId = null; }
    var getTestUserName = function getTestUserName() { return Meteor.users.findOne({username: testUser}).name; }
    var getTestUser = function getTestUser() { return Meteor.users.findOne({username: testUser}); }
    describe('User profiles', function() { 
      beforeEach(function() { 
        logout();
      });

      afterEach(function() { 
        logout();
      });

      it('Should be editable by a logged-in user', function() { 
        var testUserName = getTestUserName();

        loginTestUser();
        expect(updateUserProfile('name', 'Totally made-up name')).to.be.true;
        getTestUserName().should.equal('Totally made-up name');
        updateUserProfile('name', testUserName);
        logout();
      }); // end should be editable

      it('Should not be editable by a logged-out user', function() { 
        var testUserName = getTestUserName();
        var test = function test() { updateUserProfile('name', 'Totally made-up name'); }

        expect(test).to.throw('User is not logged in');
        expect(getTestUserName()).to.equal(testUserName);
        logout();
      }); // end should not be editable

      it('Should reject bogus fields', function() { 
        loginTestUser();
        var test = function() { updateUserProfile('bogusField', 'Totally made-up field'); }
        expect(test).to.throw('are editable');
        expect(Meteor.users.findOne({_id: this.userId}).bogusField).to.not.exist;
        logout();
      }); // end should reject bogus fields
    }); // end describe user profiles
    /**
     * Assumes no user is logged in and all users have no viscosity rating
     */
    describe('User viscosity rating calculation', function() { 
      var now = new Date();
      var sixMonths = new Date(now - 1000 * 3600 * 24 * 30 * 6); // should have decayed to roughly 1/2
      var oneYear = new Date(now - 1000 * 3600 * 24 * 365); // should have decayed to ~0
      var twoYears = new Date(now - 1000 * 3600 * 24 * 365 * 2); // should have definitely decayed to 0
      var testUserViscosity = function() { return calculateViscosityRating(getTestUser()); }
      /**
       * Reset viscosity
       */
      beforeEach(function() { 
        Meteor.users.update({username: testUser}, {$set: {viscosityEvents: [], viscosityAdmin: false}});
      });
      /**
       * Clean up after yourself
       */
      after(function() { 
        Meteor.users.update({username: testUser}, {$set: {viscosityEvents: [], viscosityAdmin: false}});
      });

      it('Should calculate viscosity correctly for non-decaying viscosities', function() {
        Meteor.users.update({username: testUser}, {$set: {viscosityEvents: [{ type: 'Test', score: 30, timestamp: twoYears, decays: false}]}});
        testUserViscosity().should.equal(30);
      });

      it('Should calculate viscosity correctly for decaying viscosities', function() {
        var visc;
        Meteor.users.update({username: testUser}, {$set: {viscosityEvents: [{ type: 'Test', score: 100, timestamp: sixMonths, decays: true}]}});
        visc = testUserViscosity();
        visc.should.be.greaterThan(40)
        visc.should.be.lessThan(60);

        Meteor.users.update({username: testUser}, {$set: {viscosityEvents: [{ type: 'Test', score: 100, timestamp: oneYear, decays: true}]}});
        visc = testUserViscosity()
        visc.should.equal(0);

        Meteor.users.update({username: testUser}, {$set: {viscosityEvents: [{ type: 'Test', score: 100, timestamp: twoYears, decays: true}]}});
        testUserViscosity().should.equal(0); // Shouldn't drop below 0
      });      

      it('Should calculate viscosity correctly across multiple viscosity events', function() { 
        var visc;
        Meteor.users.update({username: testUser}, {$set: {viscosityEvents: [
          { type: 'Test', score: 100, timestamp: sixMonths, decays: false}, 
          { type: 'Test', score: 100, timestamp: sixMonths, decays: true},
          { type: 'Test', score: 100, timestamp: twoYears, decays: true}, 
          ]}});
        
        visc = testUserViscosity()
        visc.should.be.greaterThan(140);
        visc.should.be.lessThan(160);
      });

      it('Should correctly floor viscosity for users who have achieved adminship', function() { 
        Meteor.users.update({username: testUser}, {$set: {viscosityEvents: [
          { type: 'Test', score: 100, timestamp: twoYears, decays: true}, 
          ], viscosityAdmin: true}});
        
        testUserViscosity().should.equal(100);
      });
    }); // end describe user viscosity rating calculation
    /**
     * Assumes that the test user has no viscosity rating
     */
    describe('Adding viscosity events', function() { 
      var now = new Date();
      var fiveMin = new Date(now - 1000 * 60 * 5);
      var twoDays = new Date(now - 1000 * 3600 * 24 * 2);
      var clearTestViscosity = function clearTestViscosity() { 
        Meteor.users.update({username: testUser}, {$set: {viscosityEvents: [], viscosityAdmin: false}}); 
      }
      /**
       * Reset viscosity
       */
      beforeEach(function() { 
        clearTestViscosity();
      });
      /**
       * Clean up after yourself
       */
      after(function() { 
        clearTestViscosity();
      });

      it('Should reject bogus users', function() { 
        var test = function() { addViscosityEvent([getTestUser()._id, 'totallymadeupuserid'], 'insertSqueak'); }
        expect(test).to.throw('Found 1 of requested 2');
      });

      it('Should reject bogus types', function() { 
        var test = function() { addViscosityEvent([getTestUser()._id], 'totallymadeuptype'); }
        expect(test).to.throw('Unknown viscosity event type');
      });

      it('Should cap certain types after 5 have been achieved in one day', function() { 
        var capTypes = ['insertSqueak', 'voteForSqueak', 'commentOnSqueak', 'proposeSqueakSolution', 'moveToClose', 'voteOnMotion'];
        _.each(capTypes, function(type) { 
          var user;
            
          _.each([1,2,3,4,5], function(index) { // insert the 5 test ones
            Meteor.users.update({username: testUser}, {$push: {viscosityEvents: 
              { type: type, score: 20, timestamp: fiveMin, decays: false} 
            }});
          });
            
          expect(addViscosityEvent([getTestUser()._id], type)).to.be.true;
          user = getTestUser();
          expect(user.viscosityEvents).to.have.length(6); // should still show up
          expect(user.viscosityEvents[5].score).to.equal(0); // But shouldn't have actually given him a rating.
          clearTestViscosity();
        });
      });

      it('Should not cap the other types even if 5 have been achieved in one day', function() { 
        var notCapTypes = ['votedCorrectly', 'votedIncorrectly', 'motionPassed', 'motionRejected', 'resolutionPassed', 'resolutionRejected', 
          'squeakResolved', 'squeakRejected'];
        _.each(notCapTypes, function(type) { 
          var user;

          _.each([1,2,3,4,5], function(index) { // insert the 5 test ones
            Meteor.users.update({username: testUser}, {$push: {viscosityEvents: 
              { type: type, score: 20, timestamp: fiveMin, decays: false} 
            }});
          });
            
          expect(addViscosityEvent([getTestUser()._id], type)).to.be.true;
          user = getTestUser();
          expect(user.viscosityEvents).to.have.length(6); // should show up
          expect(user.viscosityEvents[5].score).to.not.equal(0); // And should have a real rating
          clearTestViscosity();
        });
      });

      it('Should not cap if there are > 5 events, but they are not within the last day', function() { 
        var capTypes = ['insertSqueak', 'voteForSqueak', 'commentOnSqueak', 'proposeSqueakSolution', 'moveToClose', 'voteOnMotion'];
        _.each(capTypes, function(type) { 
          var user;

          _.each([1,2,3,4,5], function(index) { // insert the 5 test ones
            Meteor.users.update({username: testUser}, {$push: {viscosityEvents: 
              { type: type, score: 20, timestamp: twoDays, decays: false} 
            }});
          });
            
          expect(addViscosityEvent([getTestUser()._id], type)).to.be.true;
          user = getTestUser();
          expect(user.viscosityEvents).to.have.length(6); // should show up
          expect(user.viscosityEvents[5].score).to.not.equal(0); // And should have a rating
          clearTestViscosity();
        });
      });

      it('Should set the first instance of some types to not decay and subsequent instances to decay', function() { 
        var notDecayTypes = ['insertSqueak', 'commentOnSqueak', 'proposeSqueakSolution', 'moveToClose', 'motionPassed', 'resolutionPassed', 
          'squeakResolved'];

        _.each(notDecayTypes, function(type) { 
          var user;

          expect(addViscosityEvent([getTestUser()._id], type)).to.be.true;
          expect(addViscosityEvent([getTestUser()._id], type)).to.be.true;
          user = getTestUser();
          expect(user.viscosityEvents).to.have.length(2); // should show up
          expect(user.viscosityEvents[0].decay).to.be.false; 
          expect(user.viscosityEvents[1].decay).to.be.true; 
          clearTestViscosity();
        });
      });

      it('Should set the first instance of some types to decay', function() { 
        var decayTypes = ['voteForSqueak', 'voteOnMotion', 'votedCorrectly', 'votedIncorrectly', 'motionRejected', 'resolutionRejected', 
          'squeakRejected'];
        _.each(decayTypes, function(type) { 
          var user; 

          expect(addViscosityEvent([getTestUser()._id], type)).to.be.true;
          user = getTestUser();
          expect(user.viscosityEvents).to.have.length(1); // should show up
          expect(user.viscosityEvents[0].decay).to.be.true; 
          clearTestViscosity();
        });
      });

      it('Should update viscosity adminship if the user goes over a score of 100', function() { 
        var user; 
        Meteor.users.update({username: testUser}, {$set: {viscosityEvents: 
              [{ type: 'Test', score: 99, timestamp: now, decays: false}]
        }});
        
        expect(addViscosityEvent([getTestUser()._id], 'voteForSqueak')).to.be.true;
        user = getTestUser();
        expect(user.viscosityAdmin).to.be.true;
      });
    });
  });
}
