if (!(typeof MochaWeb === 'undefined') && blnTestSqueaks) {
  MochaWeb.testOnly(function() {
    /**
     * Assumes logged out user and Test Squeak does not exist before and after each function
     * @return void
     */
    describe('A squeak', function() { // get rid of the test squeak and logout
      /**
       * Confirm that nothing exists
       * @return True
       */
      beforeEach(function() { 
        confirmBlankSlate();
      });
      /**
       * Confirm reversion to blank slate
       * @return true on success
       */
      afterEach(function() { 
        confirmBlankSlate();
      });

      it('Should not be editable on the server from the client', function(done) {
        Squeaks.insert(testSqueak, function(error, result) {
          callbackAssertion(function() {
            expect(error).to.be.defined;
            expect(error.message).to.contain('Access denied');
            expect(result).to.not.be.defined;
            expect(findTestSqueak()).to.be.undefined;
          }, done);
          
          done();
        });
      });
    }); // end describe
  }); // end testOnly
}