/**
 * If an input has an error, display the class 'has-error'
 * @param  {String} inputName The coded name of the input (e.g., #new-user-blah might be newUserBlah).
 * @return {String}            
 */
Template.registerHelper('errorClass', function(inputName) { 
  return (Session.get('inputErrors')[inputName] ? 'has-error' : '');
})
/**
 * Return the error message associated with an input
 * @param  {String} inputName The coded name of the input (e.g., #new-user-blah might be newUserBlah).
 * @return {String}            
 */
Template.registerHelper('errorMessage', function(inputName) { 
  return (Session.get('inputErrors')[inputName]);
})
/**
 * Add an error to inputErrors Session variable
 * @param {Object} error An error in form {inputName: 'Error text'}
 * @return {void} 
 */
addInputError = function addInputError(error) { 
  var errors = Session.get('inputErrors');
  var error = _.extend(errors, error); // Write the current errors into this error
  
  Session.set('inputErrors', error);
}
/**
 * Clear an input error from a given input
 * @param  {String} inputName The encoded name of the input
 * @return {void}
 */
clearInputError = function clearInputError(inputName) {
  var errors = Session.get('inputErrors');
  errors = _.omit(errors, inputName);

  Session.set('inputErrors', errors);
}