/**
 * We can only generate the ToC once the template has been rendered, so set up a session variable to track that reactively
 * @return 
 */
Template.communityGuidelinesPage.rendered = function() { 
  var $links = $('.guidelines-content-anchor');
  var ret = [];
  $.each($links, function() { 
    ret.push({anchorName: $(this).attr('id'), anchorText: $(this).text()});
  });

  Session.set('communityGuidelinesAnchors', ret);
}
/**
 * Clean up after yourself on destruction; we're no monsters
 */
Template.communityGuidelinesPage.destroyed = function() { 
  Session.set('communityGuidelinesAnchors', null);
}
/**
 * Helpers for the community guidelines template (community-guidelines-page-template.html)
 */
Template.communityGuidelinesPage.helpers({
  /**
   * Look through the page content, grab any anchors and return them in an array of object
   * @return {[Object]} with contents {anchorName: String, anchorText: String}
   */
  contents: function() { 
    return Session.get('communityGuidelinesAnchors');
  }
});
/**
 * Click handlers for the communityGuidelinesPage
 */
Template.communityGuidelinesPage.events({
  'click .guidelines-content-link': function(event) {
    var targetId = $(event.currentTarget).attr('href') // we store the traget's ID in the href of this guy
    var offset = $(targetId).closest('div').offset().top;

    // Scrolls the top of the page.  We want to scroll the bottom of the navbar to there.
    offset = offset - parseInt($('#header-navbar').css('height')); 
    event.preventDefault();

    $('html, body').scrollTop(offset);
   }
});