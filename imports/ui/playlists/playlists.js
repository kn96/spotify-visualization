Template.playlistSummary.helpers({
  playlistImage(images) {
    if (images.length > 0) {
      return images[0].url
    }
  },
  no_access(playlistOwner, isPublic, isCollaborative) {
    if (playlistOwner === Meteor.user().id || isPublic || isCollaborative) {
      return false
    } else {
      return true
    }
  }
})