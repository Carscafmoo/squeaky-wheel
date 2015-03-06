/**
 * this file relies heavily on available lib functions in ./a.js, including -- gasp -- global variables
 */
if (!(typeof MochaWeb === 'undefined') && blnTestUsers) {
  MochaWeb.testOnly(function() {
    var getTestUserName = function() { 
      return Meteor.users.findOne({username: testUser}).name;
    }
    /**
     * Makes no real assumptions
     * @return void
     */
    describe("The Users collection", function() {
      it("Should be available to the client", function() { 
        loginTestUser(function() { 
          callbackAssertion(function() { 
            expect(Meteor.users.find({}).count()).to.be.at.least(1);
          });
          
          logout();
        });
      });

      it("Should contain the user's full dataset, but no other data set", function(done) { 
        loginTestUser(function() { 
          callbackAssertion(function() { 
            expect(Meteor.user().services).to.exist;
            expect(Meteor.users.findOne({username: otherUser})).to.not.exist;
          }, done);

          logout(function() { 
            done();
          }); // end logout
        }); // end login
      });
    }); // end describe The Squeak Collection  
  }); // End testOnly
} // end MochaWeb