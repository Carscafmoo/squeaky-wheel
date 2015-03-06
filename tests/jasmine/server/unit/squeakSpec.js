describe("A Squeak", function() { 
  it("Should be defined as unique by name on startup", function() { 
    spyOn(Squeaks, '_ensureIndex').and.callFake(function(){ return true; }); // Build a fake version of ensureIndex
    Meteor.startup();
    expect(Squeaks._ensureIndex).toHaveBeenCalledWith({title: 1}, {unique: true});
  });
}); // Here we go:
/**
 * Require Title, Description
 * Require being logged in
 * Cannot have duplicate titles
 * Cannot submit from client w/o being a logged-in user
 */