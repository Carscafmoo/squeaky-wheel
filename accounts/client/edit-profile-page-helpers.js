/**
 * Determine if the edit profile form is complete
 * @return {Boolean} true if complete, false if not
 * @author  moore
 */
var formIsComplete = function formIsComplete() { 
  var newPass = $('#input-new-password').val();
  var confirmPass = $('#confirm-new-password').val();

  return ( $('#input-old-password').val() && 
    newPass &&
    confirmPass === newPass &&
    validatePassword(newPass));
}
/**
 * Determine if the passwords and confirm-password match; if not, display error
 * @return {void}]
 */
var confirmPasswordMatch = function confirmPasswordMatch() { 
  var newP = $('#input-new-password').val();
  var confirmP = $('#confirm-new-password').val();

  if (newP && confirmP && newP !== confirmP) { addInputError({confirmPassword: 'Passwords do not match'}); }
  else { clearInputError('confirmPassword'); }
}
/**
 * Submit an input and update its value; helper for doing things like updating name and email.
 * @param  {String} input The input to submit and update (e.g. 'email')
 * @return void
 */
var submitInputAndUpdate = function submitInputAndUpdate(input) {
  var $input = $('#input-user-' + input);
  var name = $input.val();
  Meteor.call('updateUserProfile', input, name, function(error) { 
    if (error) { 
      throw error; 
    }

    $input.attr('placeholder', Meteor.user()[input]);
    $input.val('');
  });
}

Template.editProfilePage.created = function() {
  Session.set('inputErrors', {});
}
/**
 * Event handlers for the edit profile template (edit-profile-page-template.html)
 * @author  moore
 */
Template.editProfilePage.events({
  /**
   * Clicking submt name should update the name on the server and reset the form
   */
  'click #submit-name-update': function() { 
    submitInputAndUpdate('name');
  },
  /**
   * Clicking submt name should update the email on the server and reset the form
   */
  'click #submit-email-update': function() { 
    submitInputAndUpdate('email');
  },
  /**
   * new password needs to check the form, etc.
   */
  'click #submit-new-password': function(event) { 
    event.preventDefault();

    var $oldPass = $('#input-old-password');
    var $newPass = $('#input-new-password');
    var $confirmPass = $('#confirm-new-password'); 

    Accounts.changePassword($oldPass.val(), $newPass.val(), function(error) { 
      if (error) { 
        addInputError({submitNewPassword: error.reason});
        throw(error);
      }
      
      var $newPassConfirm = $('#new-password-confirmation');
      
      // Otherwise clear the inputs and display a success message
      $oldPass.val('');
      $newPass.val('');
      $confirmPass.val('');
      $newPassConfirm.text('Password successfully changed.');
      // And slowwwwwly fade away
      setTimeout(function() { 
        $newPassConfirm.fadeOut(3000,function() { 
          $newPassConfirm.text('');
          $newPassConfirm.show(); // make sure it still shows for next time!
        });
      }, 3000); // fade out after 3 seconds.
    });
  },
  /**
   * Check if the form is complete after every keystroke
   * @FIXME There's gotta be a better way (noting that 'change' is not a real solution)
   */
  'keyup #form-change-password': function() {
    if (formIsComplete()) { 
      $('#submit-new-password').removeClass('disabled'); 
    } else { 
      $('#submit-new-password').addClass('disabled'); 
    }
  },
  /**
   * When the new password is entered, validate it
   */
  'change #input-new-password': function() { 
    confirmPasswordMatch(); // Set the error if the new password and confirm password don't match
    if (!validatePassword($('#input-new-password').val())) { 
      addInputError({newPassword: "Passwords must be at least 7 characters and contain non-alphabetic characters"});
    } else { 
      clearInputError('newPassword');
    }
  },
  'change #confirm-new-password': function() { 
    confirmPasswordMatch();
  }
});
/**
 * Helpers for template editProfilePage
 * @author  moore
 */
Template.editProfilePage.helpers({
  /**
   * Disable the #submit-new-password button if the form is incomplete
   * @return {String}
   */
  newPasswordClass: function() { 
    return (formIsComplete() ? '' : 'disabled');
  }
})