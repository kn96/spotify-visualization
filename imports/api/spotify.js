Meteor.methods({
  getPlaylists: function () {
    var spotifyApi = new SpotifyWebApi()
    var response = spotifyApi.getUserPlaylists(Meteor.user().services.spotify.id, {})

    if (checkTokenRefreshed(response, spotifyApi)) {
      var response = spotifyApi.getUserPlaylists(Meteor.user().services.spotify.id, {})
    }
    return response.data.body.items
  },
  getPlaylist: function (playlistId) {
    var spotifyApi = new SpotifyWebApi()
    var response = spotifyApi.getPlaylist(Meteor.user().services.spotify.id, playlistId, {})

    if (checkTokenRefreshed(response, spotifyApi)) {
      var response = spotifyApi.getPlaylist(Meteor.user().services.spotify.id, playlistId, {})
    }
    return response.data.body
  },
  getPlaylistTracks: function (playlistId) {
    var spotifyApi = new SpotifyWebApi()
    var response = spotifyApi.getPlaylistTracks(Meteor.user().services.spotify.id, playlistId, {})
    if (checkTokenRefreshed(response, spotifyApi)) {
      var response = spotifyApi.getPlaylistTracks(Meteor.user().services.spotify.id, playlistId, {})
    }
    return response.data
  },
  getUser: function () {
    var spotifyApi = new SpotifyWebApi()
    var response = spotifyApi.getUser(Meteor.user().services.spotify.id)
    if (checkTokenRefreshed(response, spotifyApi)) {
      var response = spotifyApi.getUser(Meteor.user().services.spotify.id)
    }
    return response.data
  },
  getArtists: function (artistIds) {
    var spotifyApi = new SpotifyWebApi()
    var response = spotifyApi.getArtists(artistIds)
    if (checkTokenRefreshed(response, spotifyApi)) {
      var response = spotifyApi.getArtists(artistIds)
    }
    return response.data
  },
})

var checkTokenRefreshed = function(response, api) {
  if (response.error && response.error.statusCode === 401) {
    api.refreshAndUpdateAccessToken();
    return true;
  } else {
    return false;
  }
}