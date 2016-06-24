/*
 * Client configuration for songs table view
 */

Template.spotify.onCreated( function spotifyOnCreated() {
  console.log('Created!')
  this.dict = new ReactiveDict()
  const instance = Template.instance()
  Meteor.call('getPlaylists', function (error, result) {
    console.log('Retrieved playlists')
    instance.dict.set('playlists', result)
  })
})

Template.user.onCreated( function userOnCreated () {
  this.dict = new ReactiveDict()
  const instance = Template.instance()
  Meteor.call('getUser', function (error, result) {
    console.log('Retrieved user data')
    instance.dict.set('userProfile', result.body)
  })
})

Template.spotify.onRendered( function spotifyOnRendered() {
})


Template.spotify.helpers({
  hasCurrentPlaylist() {
    if (Template.instance().dict.get('currentPlaylist')) {
      console.log('There\'s a new playlist')
      return true
    } else {
      console.log('No new playlist')
      return false
    }
  },
  playlists() {
    console.log(Template.instance().dict.get('playlists'))
    return Template.instance().dict.get('playlists')
  },
  playlistName() {
    if (Template.instance().dict.get('currentPlaylist') !== undefined) {
      return Template.instance().dict.get('currentPlaylist').name
    }
  },
  largeImage() {
    if (Template.instance().dict.get('currentPlaylist') !== undefined) {
      return Template.instance().dict.get('currentPlaylist').images[0].url
    }
  },
  songs() {
    if (Template.instance().dict.get('currentPlaylistTracks') !== undefined) {
      return Template.instance().dict.get('currentPlaylistTracks')
    }
  },
  songCount() {
     if (Template.instance().dict.get('currentPlaylistTracks') !== undefined) {
      return Template.instance().dict.get('currentPlaylistTracks').length
    }
  }
})

Template.spotify.events({
  'click .playlistButton'(event, instance) {
    console.log('changing playlist')
    Meteor.call('getPlaylist', event.target.id, function (error, result) {
      instance.dict.set('currentPlaylist', result)
      instance.dict.set('currentPlaylistTracks', [])
    })
    Meteor.call('getPlaylistTracks', event.target.id, function (error, result) {
      instance.dict.set('currentPlaylistTracks', result)
      console.log(result)
    })
  }
})

Template.song.helpers({
  albumArt() {
    return this.track.album.images[2].url
  },
  artistNames() {
    var allArtists = ""
    for (var j = 0, len = this.track.artists.length; j < len; j++) {
      if (allArtists !== "") {
        allArtists = allArtists + ", "
      }
      allArtists = allArtists + this.track.artists[j].name
    }
    return allArtists
  }
})

Template.user.helpers({
  display_name() {
    if (Meteor.user()) {
      return Meteor.user().profile.display_name
    }
  },
  id() {
    if (Meteor.user()) {
      return Meteor.user().profile.id
    }
  },
  profile_picture() {
    if (Template.instance().dict.get('userProfile')) {
      return Template.instance().dict.get('userProfile').images[0].url
    }
  },
  followers() {
    if (Template.instance().dict.get('userProfile')) {
      return Template.instance().dict.get('userProfile').followers.total
    }
  }
})

Template.playlistSummary.helpers({
  playlistImage(images) {
    return images[0].url
  },
  no_access(playlistOwner, isPublic, isCollaborative) {
    if (playlistOwner === Meteor.user().id || isPublic || isCollaborative) {
      return false
    } else {
      return true
    }
  }
})