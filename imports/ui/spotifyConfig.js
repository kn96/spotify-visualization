Template.spotify.onCreated( function spotifyOnCreated() {
  console.log('Created!')
  this.dict = new ReactiveDict()
  const instance = Template.instance()
  Meteor.call('getPlaylists', function (error, result) {
    console.log('Retrieved playlists')
    instance.dict.set('playlists', result)
  })
})

Template.spotify.onRendered( function spotifyOnRendered() {
})


Template.spotify.helpers({
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
    return Template.instance().dict.get('playlists')
  },
  playlistName() {
    return Template.instance().dict.get('currentPlaylist').name
  },
  mediumImage() {
    return Template.instance().dict.get('currentPlaylist').images[1].url
  },
  songs() {
    return Template.instance().dict.get('currentPlaylist').tracks.items
  }
})

Template.spotify.events({
  'click .playlistButton'(event, instance) {
    console.log('changing playlist')
    Meteor.call('getPlaylist', event.target.id, function (error, result) {
      instance.dict.set('currentPlaylist', result)
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
