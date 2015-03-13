Template.editSqueakPage.created = function() { 
  Session.set('inputErrors', {});
}
/**
 * Event listeners for edited Squeaks
 */
Template.editSqueakPage.events({
  /**
   * Clicking the delete button brings up a confirmation, then deletes the Squeak in question.
   */
  'click .delete-button': function(event) { 
    event.preventDefault();
    // add in a confirm here
    if (confirm('Are you sure you want to delete this Squeak?  Deletion is permanent and cannot be undone.')) {
      Meteor.call('deleteSqueak', this._id, function(error, success) { 
        if (error) { throw error; }

        Router.go('home');
      });
    }
  },
  /**
   * Clicking the submit button on any one should call the update function.
   */
  'click .submit-update': function(event) { 
    event.preventDefault();
    var $target = $(event.currentTarget);
    var field = $target.attr('field');
    var value = $target.closest('div').find('.input-group-value').val();
    Meteor.call('editSqueak', this._id, field, value, function(error, success) { 
      if (error) { 
        var inputError = {}
        inputError['editSqueak' + field] = error.error;
        addInputError(inputError);

        throw error;
      }

      clearInputError('editSqueak' + field);
      var $confirm = $('#new-' + field + '-confirmation');
      $confirm.text('Change successful');
      // And slowwwwwly fade away
      setTimeout(function() { 
        $confirm.fadeOut(3000,function() { 
          $confirm.text('');
          $confirm.show(); // make sure it still shows for next time!
        });
      }, 3000); // fade out after 3 seconds.
    });  
  }
})