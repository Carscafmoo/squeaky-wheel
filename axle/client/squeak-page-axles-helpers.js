/**
 * Unfortunately, we have to manually  bind the destruction of the tag input to the destruction of the boostrap tag input object
 * See http://stackoverflow.com/questions/2200494/jquery-trigger-event-when-an-element-is-removed-from-the-dom for more info.
 *
 * For reasons that are not 100% clear to me, we can't use the Template.axles.destroyed()... it creates two inputs
 * @author  moore
 */
(function($){
  $.event.special.destroyed = {
    remove: function(o) {
      if (o.handler) {
        o.handler()
      }
    }
  }
})(jQuery);
/**
 * Deal with creating the bootstrap taginput on form render
 * @author moore
 */
Template.squeakPageAxles.rendered = function() {
  var $axlestag = $('.axlestag');

  // Initialise tags input
  $axlestag.tagsinput({
    trimValue: true
  });

  $('.bootstrap-tagsinput input').typeahead({
    /**
     * Pull our values from the server
     */
    source: function(query, process) { 
      Meteor.call('queryAxleNames', query, function(err, success) { 
        if (err) { 
          throw(err);
        }
        
        process(success); 
      });
    }, 
    /**
     * Don't start autocompleting until we get 3 characters to match against
     * @type {Number}
     */
    minLength: 3,
    /**
     * Update the tagsinput to have the new item
     * @return {[type]}      [description]
     */
    updater: function(item) { 
      $axlestag.tagsinput('add', item);
    }
  });

  $axlestag.on('itemAdded', function(event) {
    var axle = event.item;
    var squeakId = $(this).attr('squeak');
    Meteor.call('tagSqueakToAxle', squeakId, axle, function(error, success) { 
      if (error) { $axlestag.remove(axle); } // this needs dealing with.
      Meteor.subscribe('axleBySqueak', squeakId); // re-subscribe so we have this axle on the client.
    });
  });

  $axlestag.on('itemRemoved', function(event) { 
    var axle = event.item;
    if (!axle) { return false; } // this can get triggered even if nothing is removed if you press backspace while typing

    var squeakId = $(this).attr('squeak');
    Meteor.call('removeSqueakFromAxle', squeakId, axle, function(error, success) { 
      if (error) { $axlestag.add(axle); } // this needs dealing with.
      Meteor.subscribe('axleBySqueak', squeakId); // re-subscribe so we have the correct axles on the client.
    });
  });

  /**
   * See above re: manual binding of destrution...
   */
  $('#axle-input').bind('destroyed', function() {
    $axlestag.tagsinput('destroy');
  });
};
/**
 * Helpers for axle template (squeak-page-axles-template.html)
 * @author  moore
 */
Template.squeakPageAxles.helpers({
  /**
   * Pull the tagged axles out of the DB and return an array of objects with their names
   * @return {[Object]} the array of axle names
   */
  getAxles: function() {
    var axles = Axles.find({_id: {$in: this.axles}});
    var names = [];
    
    axles.forEach(function(axle) { names.push({name: axle.name}); });
    names.sort(function(a, b) { 
      if (a.name < b.name) { return -1; }
      if (b.name < a.name) { return 1; }
      return 0;
    });

    return names;
  },
  /**
   * * Pull the tagged axles out of the DB and return a string concatenating their names
   * @return {String}
   */
  getAxlesForTags: function() {
    var axles = Axles.find({_id: {$in: this.axles}});
    var names = [];
    
    axles.forEach(function(axle) { names.push(axle.name); });
    names.sort();

    return names;
  },
  /**
   * Determine if the user is the author of the Squeak
   * @return {Boolean} 
   */
  isTaggable: function() { 
    return (this.state !== 'Greased' && Meteor.userId() === this.author);
  }
});
Template.squeakPageAxles.axles = function() { 
  return [{value: 'hello'}, {value: 'world'}];
}
/**
 * Axle event handlers
 * @author  moore
 */
Template.squeakPageAxles.events({
  /**
   * Clicking the axle element should send you to the Squeak list page for that axle
   */
  'click .axle-element': function(event) { 
    Session.set('squeakListAxle', $(event.currentTarget).text());
  }
});
