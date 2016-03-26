/**
 * Configure the router -- give it default templates and tell it what to wait on
 * @author  moore
 */
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() { return Meteor.subscribe('notifications'); }, // Probably we'll need to get rid of this at some point...
  onBeforeAction: function() { 
    document.title = 'Squeaky Wheel'; 
    this.next(); 
  } // temporary title so we don't get ugly [hostname] before loading
});

/** 
 * The welcome page and its associates use a different layout than the logged-in pages do
 */
LoggedOutRouteController = RouteController.extend({ 
  layoutTemplate: 'loggedOutLayout'
});
/**
 * Route the welcome page through the logged out controller. 
 * @type {String}
 */
Router.route('/welcome', {
  name: 'welcomePage',
  controller: LoggedOutRouteController
});
/**
 * Route for the About page
 */
Router.route('/about', {
  name: 'aboutPage', 
  controller: LoggedOutRouteController
}); 
/**
 * Route the roles page to the roles template in the logged out controller
 */
Router.route('/roles', { 
  name: 'rolesPage',
  controller: LoggedOutRouteController
});
/**
 * Route the lifecycle page to the lifecycle template in the logged out controller
 */
Router.route('/life_cycle', { 
  name: 'lifeCyclePage',
  controller: LoggedOutRouteController
});
/**
 * Route the mission page to the mission template in the logged out controller
 */
Router.route('/mission', { 
  name: 'missionPage',
  controller: LoggedOutRouteController
});
/**
 * Route for the community guidelines page
 */
Router.route('/community_guidelines', { 
  name: 'communityGuidelinesPage', 
  controller: LoggedOutRouteController
});
/**
 * Route for the tutorial page
 */
Router.route('/tutorial', { 
  name: 'tutorialPage',
  controller: LoggedOutRouteController,
  data: function() { 
    return {hash: this.params.hash ? this.params.hash : 0}; 
  },
  subscriptions: function() { 
    var subscriptions = [this.subscribe('exampleSqueak')];
    var squeak = Squeaks.findOne();
    if (squeak) { 
      subscriptions.push(this.subscribe('usersBySqueak', squeak._id));
      subscriptions.push(this.subscribe('axleBySqueak', squeak._id));  
    }

    return subscriptions;
  }
});
/**
 * Route for the contact page
 */
Router.route('/contact', { 
  name: 'contactPage',
  controller: LoggedOutRouteController
});
/**
 * Route for the terms of use page
 * @type {String}
 */
Router.route('/terms_of_use', {
  name: 'termsOfUsePage',
  controller: LoggedOutRouteController
});
/**
 * Route for the privacy policy page
 * @type {String}
 */
Router.route('/privacy_policy', {
  name: 'privacyPolicyPage',
  controller: LoggedOutRouteController
});
/**
 * Route to the Demo explanation
 */
Router.route('/demo', {
  name: 'demoPage',
  controller: LoggedOutRouteController
});
/**
 * Route to the technical info page
 * @type {String}
 */
Router.route('/technical', { 
  name: 'technicalPage', 
  controller: LoggedOutRouteController
});
/**
 * For stuff that isn't yet implemented, tell people
 * @type {String}
 */
Router.route('/coming_soon', { 
  name: 'comingSoonPage' }
);
/**
 * Require login -- useful for things that -- you guessed it -- require login
 * @return void?
 * @author  moore
 */
var requireLogin = function requireLogin() { 
  if (!Meteor.user()) { 
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else { 
      Router.go('welcomePage'); // redirect all non-logged-in users to the login page.
      if (Meteor.isClient) { 
        $('html, body').scrollTop(0); // and scroll to the top of the page
      }
    }
  } else { 
    this.next();
  }
}
/**
 * Route for creating a Squeak (new-squeak-template.html)
 */
Router.route('/create_squeak', {
  name: 'createSqueakPage'
});
/**
 * Route for viewing a single Squeak (squeaks-page-template.html)
 */
Router.route('/squeak/:_id', {
  name: 'squeakPage',
  data: function() { 
    return Squeaks.findOne(this.params._id)
  },
  waitOn: function() { 
    return [Meteor.subscribe('squeakDetail', this.params._id), 
      Meteor.subscribe('axleBySqueak', this.params._id),
      Meteor.subscribe('usersBySqueak', this.params._id)];
  },
  onAfterAction: function() { // set SEO meta data
    var squeak;
    
    // The SEO object is only available on the client.
    if (!Meteor.isClient) {
      return;
    }

    squeak = this.data();
    if (squeak) { 
      SEO.set({
        title: squeak.title,
        meta: {
          description: squeak.description,
          rel_author: null
        } // og and twitter titles should be taken care of automatically
      });
    }
  }
});
/** 
 * Route for editing a given Squeak
 */
Router.route('/edit_squeak/:_id', {
  name: 'editSqueakPage',
  data: function() { 
    return Squeaks.findOne({_id: this.params._id});
  },
  waitOn: function() { 
    return Meteor.subscribe('squeakDetail', this.params._id);
  },
  onBeforeAction: function() { 
    var data = this.data();
    if (data) {
      if (Meteor.userId() !== data.author) { 
        this.render('accessDenied');
      } else { 
        this.next();
      }
    } else { 
      this.render(this.loadingTemplate);
    }
  }
});
/**
 * Route for displaying a random Squeak.
 */
Router.route('/random', { 
  name: 'randomView',
  template: 'loading', // This stops us from getting a 404 while waiting for the data
  data: function() { 
    Meteor.call('getRandomSqueakId', function(error, success) { 
      Router.go('squeakPage', {_id: success});
    });
  }
}); 
/**
 * Route for creating a new user (account-create-template.html)
 */
Router.route('/create_account', { 
  name: 'createAccount',
  onBeforeAction: function() { 
    if (Meteor.user()) { 
      Router.go('home');
    } else { 
      this.next();
    }
  }
});
/**
 * Route for editing a user profile (edit-profile-template.html)
 */
Router.route('/edit_profile', {
  name: 'editProfilePage'
});
/** 
 * Generic controller for paginated data
 * Extensions should fill in getData(), template, and nextPath
 * @author  moore
 */
PaginatedController = RouteController.extend({
  increment: 10,
  dataLength: function() { 
    return this.getData().count(); 
  },
  /**
   * leave open a hook to define further options in extensions.
   * @return Object
   */
  getDataOptions: function() { 
    return {}; 
  },
  getLimit: function() { 
    return parseInt(this.params.dataLimit) || this.increment; // Default to the default increment, but if requested give more
  },
  data: function() { 
    var hasMore = this.dataLength() === this.getLimit();
    
    return {
      ready: function() { return _.every(this.subscription, function(sub) { return sub.ready(); }) }, 
      data: this.getData(),
      nextPath: hasMore ? this.nextPath() : null,
      dataOptions: this.getDataOptions()
    }
  }
});
/**
 * Route controller for Activity page.
 * See https://www.discovermeteor.com/blog/reactive-joins-in-meteor/ for reactive publishing
 */
ActivityListController = PaginatedController.extend({
  getData: function() { 
    // requires its own limit to deal with conflicting `notifications` subscription
    return Activities.find({type: {$exists: true}}, {sort: {created: -1}, limit: this.getLimit()}) // exists filters out the other sub
      .map(function(act) { return createNewActivity(act); })
      .sort(function(a, b) { 
        if (a.activity.created > b.activity.created) { return -1; } // descending
        if (b.activity.created > a.activity.created) { return 1; }

        return 0;
      });
  },
  nextPath: function() { 
    return Router.routes.activityList.path({dataLimit: this.getLimit() + this.increment}); 
  },
  subscriptions: function() { 
    this.subscription = [Meteor.subscribe('activities', this.getLimit())];
    if (this.data().data) { 
      // Now get through each of the activities you found and pull in the info you need about it...
      var activities = this.data().data;
      var squeaksToPull = [];
      var axles = []; // collector for axles to subscribe to
      var edits = []; // collector for edit-type activities
      var editIds = []; // collector for edits to subscribe to
      var userIds = []; // collector for users to subscribe to
      
      // and add the authors subscription to the route's waiting list as well
      var squeakComments = _.filter(activities, function(activity) { // only care about the comment types for this sub.
        return activity.activity.type === 'comment' 
      }).map(function(activity) { 
        userIds.push(activity.activity.action.user);

        return activity.activity.action._id; 
      }); // return only the comment IDs.
      
      if (squeakComments.length) { this.subscription.push(Meteor.subscribe('squeakComments', squeakComments)); }

      // Subscribe to any necessary axles:
      axles = _.filter(activities, function(activity) { 
        return activity.activity.type === 'squeakTaggedToAxle' || 
          activity.activity.type === 'squeakRemovedFromAxle' ||
          activity.activity.type === 'squeakDeletedFromAxle';
      }).map(function(activity) { 
        userIds.push(activity.activity.action.user);

        return activity.activity.watched._id;
      });
      
      squeaksToPull = _.filter(activities, function(activity) { 
        return activity.activity.type === 'squeakTaggedToAxle' || 
          activity.activity.type === 'squeakRemovedFromAxle' || 
          activity.activity.type === 'squeakWorkflow';
      }).map(function(activity) { 
        var squeak = Squeaks.findOne({_id: activity.activity.action._id});
        if (squeak) { userIds.push(squeak.author); }
        
        return activity.activity.action._id;
      });

      watchedSqueaks = _.filter(activities, function(activity) { 
        return activity.activity.type === 'workflowMotionInitiated' ||
              activity.activity.type === 'workflowMotionResolved' ||
              activity.activity.type === 'workflowMotionComment' ||
              activity.activity.type === 'squeakEdited'

      }).map(function(activity) { 
        var squeak = Squeaks.findOne({_id: activity.activity.watched._id});
        if (squeak) { 
          userIds.push(squeak.author);
          _.each(squeak.motions, function(mo) { 
            userIds.push(mo.user);
            _.each(mo.comments, function(co) { 
              userIds.push(co.author);
            });
          });
        }

        return activity.activity.watched._id});

      // Pull any edits we may require:
      edits = _.filter(activities, function(activity) { 
        return activity.activity.type === 'squeakEdited' 
      });

      editIds = edits.map(function(activity) { 
        userIds.push(activity.activity.action.user);

        return activity.activity.action._id 
      });

      squeaksToPull = _.union(squeaksToPull, watchedSqueaks);
      if (squeaksToPull.length) { this.subscription.push(Meteor.subscribe('squeaksByIds', squeaksToPull)); }
      if (editIds.length) { this.subscription.push(Meteor.subscribe('editsByIds', editIds)); }
      if (axles.length) { this.subscription.push(Meteor.subscribe('axleById', axles)); }
      if (userIds.length) { this.subscription.push(Meteor.subscribe('usersById', _.uniq(userIds))); }
    }
  },
  dataLength: function() { 
    return this.getData().length;
  }
});
/**
 * Route for viewing recent activity (activity-list-template.html)
 * @todo  turn this into a paginated thing
 */
Router.route('/activity/:dataLimit?', { 
  name: 'activityList'
});
/**
 * Generic controller for SqueakLists; could be sorted or limited in any # of ways in extensions.
 *   Extensions need to fill in getSort() and getNextPath
 * All of these end up in squeaks-list-template.html
 * @author  moore
 */
SqueakListController = PaginatedController.extend({
  template: 'squeakList',
  subscriptions: function() {
    this.subscription = [];
    var users = [];
    var squeaks = this.getData();
    var axleName = Session.get('squeakListAxle');
    
    if (axleName) { 
      this.subscription.push(Meteor.subscribe('axleByName', axleName));
    } 

    this.subscription.push(Meteor.subscribe('squeaks', this.getWhich(), this.getOptions())); 
    
    // Pull in all author data:
    if (squeaks) { 
      users = squeaks.map(function(squeak) { return squeak.author; });

      this.subscription.push(Meteor.subscribe('usersById', users));
    }
  },
  getData: function() { 
    return Squeaks.find(this.getWhich(), this.getOptions()); 
  },
  getWhich: function() { 
    var which = {};
    var res = Session.get('squeakListResolution');
    var me = Meteor.userId();
    var currentWhich;
    var currentAxle;

    me = me ? me : ''; // This fixes a brief error on logout when restricting the view by author

    if (!res) { 
      res = 'a';
      Session.set('squeakListResolution', res) // set the default for everyone!
    }

    if (res === 's') { 
      which.state = 'Squeaky'; 
    } else if (res === 'g') { 
      which.state = 'Greased'; 
    } else if (res === 'r') { 
      which.state = 'Rejected'; 
    } else if (res === 'i') { 
      which.state = 'Under inspection'; 
    }

    currentWhich = Session.get('squeakListWhich');
    if (!currentWhich) { // she's a which! burn her!
      currentWhich = 'a'; // Set the default for everyone!
      Session.set('squeakListWhich', currentWhich);
    }

    if (currentWhich === 'm') { 
      which.author = me;
    } else if (currentWhich === 'w') {
      which.watchers = me;
    }

    currentAxle = Session.get('squeakListAxle');
    if (currentAxle) { 
      axle = Axles.findOne({name: currentAxle});
      if (axle) { 
        which.axles = axle._id;
      } else {
        which.axles = ''; 
      } 
    }
    
    return which;
  },
  getOptions: function() { 
    return {sort: this.getSort(), limit: this.getLimit() }; 
  },
  getSort: function() { 
    var sorting = Session.get('squeakListSorting');
    if (!sorting) { 
      sorting = 'v'; // Sort by volume by default
      Session.set('squeakListSorting', sorting);
    }

    if (sorting === 'n') { return {createdAt: -1, title: 1, _id: 1}; } // newest
    else { return {votes: -1, title: 1, _id: 1}; } // volume
  },
  getLimit: function() { 
    return parseInt(this.params.dataLimit) || this.increment; // Default to the default increment, but if requested give more
  },
  nextPath: function() { 
    var data = JSON.parse(JSON.stringify(this.params)); // clonage
    data.dataLimit = this.getLimit() + this.increment;

    return Router.routes.squeakList.path(data);
  }
});
/**
 * Route for the homepage
 */
Router.route('/', {
  name: 'home', 
  controller: SqueakListController // eventually, this maybe becomes configurable?
}); // I think home might have to come first?  It gets less to more specific?  And then the rest are figured out somehow which controller gets used?
/**
 * route for the newest squeaks
 */
Router.route('/squeaks/:dataLimit?', { // It can figure out which controller to use by the controller's name apparently
  name: 'squeakList',
});
/**
 * Route for the axle view (axle-view-template.html)
 */
Router.route('/axles/:dataLimit?', {
  name: 'axleList'
});
/**
 * Route to the search page
 */
Router.route('/search/:searchTerm?', { 
  name: 'searchPage',
  data: function() { 
    return this.params.query;
  }
});
/**
 * Before all pages that require login, require login!
 */
var noLoginRequired = ['createAccount', 
                        'welcomePage', 
                        'aboutPage',
                        'lifeCyclePage', 
                        'rolesPage', 
                        'missionPage', 
                        'comingSoonPage',
                        'communityGuidelinesPage',
                        'tutorialPage',
                        'contactPage',
                        'privacyPolicyPage',
                        'termsOfUsePage',
                        'demoPage',
                        'technicalPage']
Router.onBeforeAction(requireLogin, {except: noLoginRequired});
/**
 * Add all routes we care about being searchable to the sitemap:
 */
if (Meteor.isServer) { 
  sitemaps.add('/sitemap.xml', function() { 
    var minLastMod = _.min([new Date('2015-03-27 00:00:00 GMT-0400'), new Date()]);
    var pages = [];
    pages.push({page: '/welcome', lastmod: minLastMod, changefreq: 'yearly'});
    pages.push({page: '/about', lastmod: minLastMod, changefreq: 'yearly', priority: .8});
    pages.push({page: '/roles', lastmod: minLastMod, changefreq: 'yearly', priority: .2});
    pages.push({page: '/life_cycle', lastmod: minLastMod, changefreq: 'yearly', priority: .2});
    pages.push({page: '/mission', lastmod: minLastMod, changefreq: 'yearly', priority: .2});
    pages.push({page: '/community_guidelines', lastmod: minLastMod, changefreq: 'yearly'});
    pages.push({page: '/tutorial', lastmod: minLastMod, changefreq: 'yearly', priority: .4});
    pages.push({page: '/demo', lastmod: minLastMod, changefreq: 'yearly', priority: .2});
    pages.push({page: '/technical', lastmod: minLastMod, changefreq: 'yearly'});
    pages.push({page: '/contact', lastMod: minLastMod, changefreq: 'yearly'});

    // Loop through all Squeaks and add them as well
    Squeaks.find().forEach(function(squeak) { 
      var page = {page: 'squeak/' + squeak._id};

      // Find the last time it was updated... note that nothing is actually older than initial deployment time
      var updated = minLastMod;
      if (squeak.createdAt > updated) { updated = squeak.createdAt; }
      _.each(squeak.comments, function(comment) { 
        if (comment.createdAt > updated) { updated = comment.createdAt; }
      });
    
      _.each(squeak.motions, function(mo) { 
        if (mo.created > updated) { updated = mo.created; }
        _.each(mo.comments, function(comment) { 
          if (comment.createdAt > updated) { updated = comment.createdAt; }
        });

        if (mo.resolved && mo.resolved > updated) { updated = mo.resolved; }
      });
      
      if (squeak.titleEdited && squeak.titleEdited > updated) { updated = squeak.titleEdited; }
      if (squeak.descriptionEdited && squeak.descriptionEdited > updated) { updated = squeak.descriptionEdited; }
      if (squeak.targetEdited && squeak.targetEdited > updated) { updated = squeak.targetEdited; }
      if (squeak.reCreationEdited && squeak.reCreationEdited > updated) { updated = squeak.reCreationEdited; }

      page.lastmod = updated;
      page.changefreq = 'weekly'; // for now -- if we ever had traffic, increase to hourly
      pages.push(page);
    });

    return pages;
  });
}