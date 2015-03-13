if (!(typeof MochaWeb === 'undefined') && blnTestAxles) {
  MochaWeb.testOnly(function() {
    /**
     * Assume blank slate -- no Squeaks, no axles
     * @return {[type]} [description]
     */
    describe('Creating Axles from the client', function() { 
      before(function() { 
        confirmBlankSlate();
      });

      after(function() { 
        confirmBlankSlate();
      });

      it('Should be impossible', function(done) { 
        Axles.insert({name: testAxle}, function(error, success) { 
          callbackAssertion(function() { 
            expect(error).to.exist;
            expect(success).to.not.be.ok;
            expect(error.reason).to.contain('Access denied');
            expect(findTestAxle()).to.be.undefined;
          }, done);

          done();
        }); // end Axles.insert
      }); // end it should be impossible to create from client
    }); // end describe creating axles on the client
  }); // end mochaweb testonly
}