/**
 * Client-side startup functions
 */
Meteor.startup(function() { 
  /** 
   * Clear out all session variables every time a user logs out -- note, there's no onLogout hook... yet???
   */
  if (Meteor.isClient) { 
    Deps.autorun(function() { // register a reactive function around the Meteor.userId() reactive var
      if (!Meteor.userId()) {
        Session.keys = {};
      }
    });

    if (!Meteor.Device.isDesktop() && !Meteor.Device.isBot()) { // then you're mobile
      alert("Squeaky Wheel is currently optimized for full-sized browser viewing and may not work on mobile devices.");
    }

    // Dynamically generate the host URL for images regardless of where we're being viewed from
    var logoUrl = window.location.origin + '/img/logo.svg';
    SEO.config({ // default SEO meta tags.
      title: 'Squeaky Wheel',
      meta: {
        description: 'Squeaky Wheel is a repository for the world\'s problems, great and small.  Join now and be heard!',
        rel_author: 'https://plus.google.com/+CarsonMooreCCM' // if no other author is provided, use me!
      },
      og: { 
        image: logoUrl // display the logo as the image on FB or whatever
      },
      twitter: { 
        image: logoUrl // display logo as the image on Twitter
      }
    });
  }
});