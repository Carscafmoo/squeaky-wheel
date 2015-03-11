/**
 * Fixture data.  Run only if there are no Squeaks (e.g., after `meteor reset`)
 * Many testing scripts require the fixture data to be set up just so; changes to this data
 *   may necessitate changes to the testing scripts (or cause them to fail); additionally, further
 *   tests may require changing this data.
 * @author  moore
 */
if (Squeaks.find().count() === 0) {
  // Test users -- users used only in testing.
  var johnDoeId = Accounts.createUser({username: 'test_user', 
    email: 'test@squeaky-wheel.com', 
    password: 'test123',
    name: 'John Doe'
  });

  // Create another user that we can log in as to test stuff like "logged in user is not the author"
  var janeDoeId = Accounts.createUser({username: 'test_user1', 
    email: 'test1@squeaky-wheel.com',
    password: 'test456',
    name: 'Jane Doe'    
  });

  var jimmyDoeId = Accounts.createUser({username: 'test_user2', 
    email: 'test2@squeaky-wheel.com',
    password: 'test789',
    name: 'Jimmy Doe'
  }); // we need a third user to test some of the resolution stuff

  // We have a few users around that we can control their viscosity a little more tightly for E2E testing
  var lowViscosityUser = Accounts.createUser({username: 'wd_0', 
    email: 'wd40@squeaky-wheel.com',
    password: 'easygreasy0', 
    name: 'Low Viscosity'
  });

  // We have a few users around that we can control their viscosity a little more tightly for E2E testing
  var medViscosityUser = Accounts.createUser({username: 'wd_500',  // I obviously have no idea how viscosity grades work
    email: 'wd400@squeaky-wheel.com',
    password: 'easygreasy500', 
    name: 'Medium Viscosity'
  });

  Meteor.users.update({_id: medViscosityUser}, {$set: {viscosityEvents: [{
        type: 'test', 
        score: 500,
        timestamp: new Date(),
        decays: false}]}});

  // We have a few users around that we can control their viscosity a little more tightly for E2E testing
  var highViscosityUser = Accounts.createUser({username: 'wd_5000', 
    email: 'wd5000@squeaky-wheel.com',
    password: 'easygreasy5000', 
    name: 'High Viscosity'
  });

  Meteor.users.update({_id: highViscosityUser}, {$set: {viscosityEvents: [{
        type: 'test', 
        score: 5000,
        timestamp: new Date(),
        decays: false}]}});

  // Create a set of example axles; we want > 10 to test pagination -- probably 15.
  axles = ['Squeaky Wheel Examples', 
          'Planes', 
          'Trains', 
          'Automobiles', 
          'Lions', 
          'Tigers', 
          'Bears',
          'Movies',
          'TV',
          'Books',
          'Sports',
          'Tech',
          'Arlington VA Municipal',
          'Audio',
          'Xbox'];
  _.each(axles, function(name) { 
    Axles.insert({name: name, squeakCount: 0, watchers: []});
  });

  var axle = Axles.findOne({name: 'Squeaky Wheel Examples'})._id; // We're going to tag all of our example to this bad boy

  // Create a new user for me so I can have me own the test Squeak:
  var carsonId = Meteor.users.insert({name: 'Carson Moore', username: 'CarsonMoore', viscosityEvents: [], viscosityAdmin: false});

  var squeak = Squeaks.insert({title: 'Repository for global problems and issues that people face', 
    description: "I can't count the number of times that I see something -- ranging from minor annoyances to inefficiencies that " + 
      " take up thousands of man-hours to issues that affect the health and welfare of millions of people -- and can't help but wonder, " + 
      "'Why don't they ...?' It'd be great if we had some way of putting people in touch with the mysterious 'they,' so that they " + 
      "could either answer the question or at least be alerted to the problem; maybe it'd even get fixed!",
    reCreation: "Any time there is a problem with anything, anywhere.",
    target: "Entrepreneurs, business people, everyday folks -- everyone.",
    author: carsonId,
    state: "In the shop",
    motions: [],
    createdAt: new Date('2015-01-12 07:35:00 GMT-0500'), // this is the real first day of Squeaky Wheel!
    votes: 0,
    voters: [],
    comments: [{
        author: johnDoeId,
        createdAt: new Date('2015-10-17 07:35:17'),
        comment: 'You mentioned that this might be useful for people looking for their next big idea.' + 
          ' I wonder if it might also be useful to the people submitting the problems?'
      }, { 
        author: carsonId, 
        createdAt: new Date('2015-10-17 08:05:17'),
        comment: 'That\'s a really good point!  I\'ve edited the Squeak to include them.  Let me know if you have any other thoughts!'
      }, { 
        author: johnDoeId, // debug let's get a real author in here
        createdAt: new Date('2015-11-06 09:30:37'),
        comment: 'I think we\'ve got a really good idea on what the project is.  Does anyone think they\ can take a crack at it?'
      }, { 
        author: carsonId, // debug let's get a real author in here
        createdAt: new Date('2015-11-06 12:12:33'),
        comment: 'I can take a crack at it.  I\'m taking this to the shop!'
      }],    
    axles: [axle],
    watchers: [johnDoeId]
  });

  // Example Squeak #2: traffic light!
  var gmId = Meteor.users.insert({name: 'Garrett Morgan', username: 'CaptainInvento', viscosityEvents: [], viscosityAdmin: false}); // get it?  Captain Morgan?

  var squeak = Squeaks.insert({title: 'Mechanism for regulating the flow of automobiles at intersections', 
    description: "I have recently witnessed a collision of automobiles as they both attempted to traverse the intersection at the same time." + 
      " Surely there must be some mechanism telling which to proceed and which should halt, allowing the other to proceed first?", 
    reCreation: "Two automobiles approaching an intersection of roads orthogonally",
    target: "Conductors and passengers of automobiles",
    author: gmId,
    state: "Greased",
    motions: [{_id: new Mongo.Collection.ObjectID().valueOf(),
        proposedState: 'Greased',
        reason: null,
        user: gmId,
        created: new Date('1922-06-15 GMT-0500'),
        resolved: new Date('1922-06-15 12:00:00 GMT-0500'),
        comment: "I propose a series of colored lights above or next to the intersection; green shall henceforth mean 'go, the right-of-way" + 
          " is yours;' red shall mean 'stop, and await a green light,' and for safety it will be essential to add a yellow, informing drivers" + 
          " of the imminent changing of the light from green to red.",
        state: 'Accepted',
        score: 1000,
        comments: [],
        voters: [{userId: gmId, isFor: true}]
      }],
    createdAt: new Date('1922-01-01 GMT-0500'), 
    votes: 0,
    voters: [],
    comments: [],
    axles: [axle, Axles.findOne({name: 'Automobiles'})._id],
    watchers: [johnDoeId, gmId]
  });
  
  // Ex # 3: As the Russians would say... The meecrocheep:
  var shockleyId = Meteor.users.insert({name: 'William Shockley', username: 'BillyZapdos', viscosityEvents: [], viscosityAdmin: false}); 
  var usArmyId = Meteor.users.insert({name: 'United States Armed Forces', username: 'BaldEagle1', viscosityEvents: [], viscosityAdmin: false});

  var squeak = Squeaks.insert({title: 'Transistor capable of withstanding high temperature', 
    description: "The transistor has the potential to revolutionize our technology.  Unfortunately, the germanium can't hold up to " + 
      " the high temperatures that many of our armaments operate under.  There must be something we can do about that. This will be" + 
      " essential if we want to defeat the Reds!",
    reCreation: "Heating a transistor above 75C dramatically decreases reliability and performance of same.",
    target: "Military and high-temperature computing and actuating; the United States, her citizens, and her allies' citizens.",
    author: usArmyId,
    state: "Greased",
    motions: [{_id: new Mongo.Collection.ObjectID().valueOf(),
        proposedState: 'Greased',
        user: shockleyId,
        created: new Date('1954-01-26 GMT-0500'), // tanenbaum supposedly made one in jan '54, according to http://spectrum.ieee.org/biomedical/devices/the-lost-history-of-the-transistor
        resolved: new Date('1954-01-30 GMT-0500'),
        comment: "We can make it out of silicon using rate growing to eliminate defects.",
        state: 'Rejected',
        score: 100,
        comments: [{_id: new Mongo.Collection.ObjectID().valueOf(),
          author: shockleyId,
          comment: "Rate growing isn't scalable and will be almost impossible to manufacture.  Back to the drawing board...",
          createdAt: new Date("1954-01-28 GMT-0500")}],
        voters: [{userId: shockleyId, isFor: true}] // initial submission
      }, 
      {_id: new Mongo.Collection.ObjectID().valueOf(),
        proposedState: 'Greased',
        user: shockleyId,
        created: new Date('1955-03-17 GMT-0500'), 
        resolved: new Date('1955-03-17 12:00:00 GMT-0500'), 
        comment: "We have adapted the diffusion techniques used by Texas Instruments to silicon.",
        state: 'Accepted',
        score: 1000,
        comments: [],
        voters: [{userId: shockleyId, isFor: true}] // initial submission
      }],
    createdAt: new Date('1953-01-01 GMT-0500'), 
    votes: 0,
    voters: [],
    comments: [],
    axles: [axle, Axles.findOne({name: 'Planes'})._id, Axles.findOne({name: 'Tech'})._id],
    watchers: [johnDoeId, shockleyId, usArmyId]
  });

  // Duplicate Squeak -- let's say that uh... a radio manufacturer wanted the same thing
  var rcaId = Meteor.users.insert({name: 'Radio Corporation of America', username: 'RCA', viscosityEvents: [], viscosityAdmin: false}); 
  var squeak = Squeaks.insert({title: 'More reliable solid-state transistor', 
    description: "The transistor revolutionized radio technology.  Unfortunately, the germanium can't hold up to " + 
      " the high temperatures that many of our radios operate under.  Certainly we can do something about that?",
    reCreation: "This problem occurs every time we try to submerge our radios in warm oil", // a reference to ieee link above, and the TI demo
    target: "Anyone using a transistor radio at high temperatures",
    author: rcaId,
    state: "Rejected",
    motions: [{_id: new Mongo.Collection.ObjectID().valueOf(),
        proposedState: 'Rejected',
        reason: 'Duplicate',
        user: usArmyId,
        created: new Date('1953-03-02 GMT-0500'), // tanenbaum supposedly made one in jan '54, according to http://spectrum.ieee.org/biomedical/devices/the-lost-history-of-the-transistor
        resolved: new Date('1953-03-02 12:00:00 GMT-0500'), 
        comment: 'This might be a duplicate of the Squeak entitled \'Transistor capable of withstanding high temperature.\'',
        state: 'Accepted',
        score: 100,
        comments: [],
        voters: [{userId: usArmyId, isFor: true}] // initial submission
      }],
    createdAt: new Date('1953-03-01 GMT-0500'), 
    votes: 0,
    voters: [],
    comments: [],
    axles: [axle, Axles.findOne({name: 'Tech'})._id],
    watchers: [johnDoeId, rcaId, usArmyId]
  });
  
  // Now how about something that's been pulled due to lack of productivity
  var squeak = Squeaks.insert({title: 'Make everything better', 
    description: "What if everything were just, like, way better?",
    reCreation: "Any time something isn't great", 
    target: "Everyone, everywhere",
    author: johnDoeId,
    state: "Rejected",
    motions: [{_id: new Mongo.Collection.ObjectID().valueOf(),
      proposedState: 'Rejected',
      reason: 'Unproductive',
      user: janeDoeId,
      created: new Date('2015-02-26 12:00:00 GMT-0500'),
      resolved: new Date('2015-02-26 14:00:00 GMT-0500'),
      comment: "John, dear, I think you need to reduce the scope on this.  I don't think this will be productive.", // hahaha john deer -- his name is john doe?
      state: 'Accepted',
      score: 100,
      comments: [],
      voters: [{userId: janeDoeId, isFor: true}]
    }],
    createdAt: new Date('2015-02-26 00:00:00 GMT-0500'), 
    votes: 0,
    voters: [],
    comments: [],
    axles: [axle],
    watchers: [johnDoeId, janeDoeId]
  });

  // Example # 6: Gutenberg printing press
  var jgId = Meteor.users.insert({name: 'Johannes Gutenberg', username: 'MovableHype', viscosityEvents: [], viscosityAdmin: false}); 
  var clergyId = Meteor.users.insert({name: '15th Century Clergy', username: 'HolyRollers', viscosityEvents: [], viscosityAdmin: false});
  var squeak = Squeaks.insert({title: 'Faster production of varying text', 
    description: "Having to copy out every word on a page is tedious, painful, and takes forever.  For many productions, we have been " + 
      "able to engrave a copy of each page, but that takes forever to set up, and any small changes to text or content require us to re-" + 
      "produce each engraving.  Ideally there would be some way we could print varying text?",
    reCreation: "When copying text -- for example, when copying the Bible onto empty sheets.",
    target: "Anyone in the business of producing text.",
    author: clergyId,
    state: "Greased",
    motions: [{_id: new Mongo.Collection.ObjectID().valueOf(),
      proposedState: 'Greased',
      reason: null,
      user: jgId,
      created: new Date('1440-06-15 GMT-0500'),
      resolved: new Date('1440-06-15 12:00:00 GMT-0500'),
      comment: "We can use my new invention, the printing press, which uses movable type! Instead of engraving an entire page, " + 
          "we engrave blocks of letters which can be set and then combined in any way to produce any page.",
      state: 'Accepted',
      score: 100,
      comments: [],
      voters: [{userId: jgId, isFor: true}]
    }],
    createdAt: new Date('1401-01-01 GMT-0500'), // things moved slowly back then.
    votes: 0,
    voters: [],
    comments: [],
    axles: [axle, Axles.findOne({name: 'Tech'})._id],
    watchers: [johnDoeId, jgId, clergyId]
  });
  

  // Example #7: offensive
  var squeak = Squeaks.insert({title: 'Reducing your mother\'s weight problem', 
    description: "Your mama is just ... SO fat",
    reCreation: "Being near your mama when she takes a step and the earth shakes", 
    target: "Your mama",
    author: janeDoeId,
    state: "Rejected",
    motions: [{_id: new Mongo.Collection.ObjectID().valueOf(),
      proposedState: 'Rejected',
      reason: 'Offensive',
      user: johnDoeId,
      created: new Date("2015-02-26 14:00:00 GMT-0500"),
      resolved: new Date("2015-02-26 16:00:00 GMT-0500"),
      comment: "Jane, dear, this is a personal attack on my mother, and I find it offensive.", // hahaha john deer -- his name is john doe?
      state: 'Accepted',
      score: 100,
      comments: [],
      voters: [{userId: johnDoeId, isFor: true}]
    }],
    createdAt: new Date('2015-02-26 12:00:00 GMT-0500'), 
    votes: 0,
    voters: [],
    comments: [],
    axles: [axle],
    watchers: [johnDoeId, janeDoeId]
  });

  // Example #8: Airplane
  var wbId = Meteor.users.insert({name: 'Wright Brothers', username: 'WrightCycle', viscosityEvents: [], viscosityAdmin: false}); 
  var squeak = Squeaks.insert({title: 'Heavier than air flight', 
    description: "Streets in cities have become choked with bicycle traffic, and long distance travel is impossible by bicycle " + 
      "and therefore only possible by train.  Trains are restricted to tracks and make frequent stops.  We could eliminate these " + 
      "impediments by using all three dimensions at our disposal, and taking to the air for travel!",
    reCreation: "Taking a train ride from Ohio to North Carolina takes days and requires several stops.",
    target: "Anyone who has to travel between distant cities on a regular basis.",
    author: wbId,
    state: "Greased",
    motions: [{_id: new Mongo.Collection.ObjectID().valueOf(),
      proposedState: 'Greased',
      reason: null,
      user: wbId,
      created: new Date('1903-12-17 GMT-0500'),
      resolved: new Date("1903-12-17 12:00:00 GMT-0500"),
      comment: "We've done it!  We've invented the aeroplane!",
      state: 'Accepted',
      score: 100,
      comments: [],
      voters: [{userId: wbId, isFor: true}]
    }],
    createdAt: new Date('1899-01-01 GMT-0500'), 
    votes: 0,
    voters: [],
    comments: [],
    axles: [axle, Axles.findOne({name: 'Tech'}), Axles.findOne({name: 'Planes'})._id],
    watchers: [johnDoeId, wbId]
  });
  
  // Example #9: Vaccine
  var medId = Meteor.users.insert({name: '18th Century Doctors', username: 'MoreLeeches', viscosityEvents: [], viscosityAdmin: false}); 
  var jenId = Meteor.users.insert({name: 'Edward Jenner', username: 'a_pox_on_both_your_houses', viscosityEvents: [], viscosityAdmin: false}); 
  var squeak = Squeaks.insert({title: 'Preventing humans from developing smallpox', 
    description: "Smallpox is one of the deadliest diseases known to man.  This disease kills up to 400,000 people annually in Europe " + 
      "and is responsible for up to a third of all cases of blindness.  There must be something we can do to stop it from " + 
      "taking hold.", // wikipedia article on smallpox,
    reCreation: "Find another human infected with the pox, and you too shall become infected.",
    target: "All of mankind",
    author: medId,
    state: "Greased",
    motions: [{_id: new Mongo.Collection.ObjectID().valueOf(),
      proposedState: 'Greased',
      reason: null,
      user: jenId,
      created: new Date('1798-06-15 GMT-0500'),
      resolved: new Date('1798-06-15 12:00:00 GMT-0500'),
      comment: "I have proved that innoculation with cowpox prevents smallpox from taking root in humans." + 
          "  Now if I could just get the Royal Society to publish my paper...",
      state: 'Accepted',
      score: 100,
      comments: [],
      voters: [{userId: jenId, isFor: true}]
    }],
    createdAt: new Date('1700-01-01 GMT-0500'), 
    votes: 0,
    voters: [],
    comments: [{
      _id: new Mongo.Collection.ObjectID().valueOf(),
      author: jenId,
      comment: "I've heard an interesting tale about milk maids... I'll investigate.",
      createdAt: new Date("1796-05-14 12:00:00 GMT-0500") // date of the experiment on James Phipps
    }],
    axles: [axle],
    watchers: [johnDoeId, jenId, medId]
  });

  // Example #10: Telegraph
  var morseId = Meteor.users.insert({name: 'Samuel Morse', username: 'dot_dot_dash', viscosityEvents: [], viscosityAdmin: false}); 
  var squeak = Squeaks.insert({title: 'Instant communication across great distances', 
    description: "These United States now span nearly half the continent, and we are sure they will one day span it in its entirety." + 
      " with such great distance, and the inevitable conflicts that will arise as we acquire it, we must have some means of communicating" + 
      " from our Capital to the land she governs.  We require significantly faster communication across distances of thousands of miles.",
    reCreation: "Have two parties communicating, one in Missouri, and the other in DC.  It takes days!",
    target: "Any long-distance communicating parties",
    author: usArmyId,
    state: "Greased",
    motions: [{_id: new Mongo.Collection.ObjectID().valueOf(),
      proposedState: 'Greased',
      reason: null,
      user: morseId,
      created: new Date('1838-01-11 GMT-0500'),  
      resolved: new Date('1838-01-11 12:00:00 GMT-0500'),  
      comment: "I propose a system of wired communications using electricity to send coded messages.  I have an idea for that code...",
      state: 'Accepted',
      score: 100,
      comments: [],
      voters: [{userId: morseId, isFor: true}]
    }],
    createdAt: new Date('1830-01-01 GMT-0500'), 
    votes: 0,
    voters: [],
    comments: [],
    axles: [axle, Axles.findOne({name: 'Tech'})._id],
    watchers: [johnDoeId, usArmyId, morseId]
  });
  
  // Example #11: Radio
  // marconi -> macaroni -> stuck a feather in his cap -> yankee doodle.  Too far?
  var marconiId = Meteor.users.insert({name: 'Guglielmo Marconi', username: 'yankee_doodle', viscosityEvents: [], viscosityAdmin: false}); 
  var squeak = Squeaks.insert({title: 'Wireless communication across great distances', 
    description: "Telegraphy has become an essential component to modern life, but we are bound by the physical wires connecting two " + 
      "parties, which are expensive to lay and difficult to maintain.  It would be ideal if there were a wireless sytem such that we could " + 
      "greatly increase the freedom of our communications." ,
    target: "Any long-distance communicating parties",
    author: usArmyId,
    state: "Greased",
    motions: [{_id: new Mongo.Collection.ObjectID().valueOf(),
      proposedState: 'Greased',
      reason: null,
      user: marconiId,
      created: new Date('1896-07-27 GMT-0500'),  // first public transmission of wireless signals
      resolved: new Date('1896-07-27 12:00:00 GMT-0500'),
      comment: "We can use modulated Hertzian waves to communicate across great distances -- perhaps even using Morse's code.",
      state: 'Accepted',
      score: 100,
      comments: [],
      voters: [{userId: marconiId, isFor: true}]
    }],
    createdAt: new Date('1890-01-01 GMT-0500'), 
    votes: 0,
    voters: [],
    comments: [],
    axles: [axle, Axles.findOne({name: 'Tech'})._id],
    watchers: [johnDoeId, usArmyId, marconiId]
  });

  // Now go through each of the Squeaks and deal with the axle count for each one... 
  Squeaks.find({}).forEach(function(squeak) { 
    _.each(squeak.axles, function(axle) { 
      Axles.update({_id: axle}, {$inc: {squeakCount: 1}});
    });
  });
}