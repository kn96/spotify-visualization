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
    console.log(playlistId)

    if (checkTokenRefreshed(response, spotifyApi)) {
      var response = spotifyApi.getPlaylist(Meteor.user().services.spotify.id, playlistId, {})
    }
    return response.data.body
  }
})

var checkTokenRefreshed = function(response, api) {
  if (response.error && response.error.statusCode === 401) {
    api.refreshAndUpdateAccessToken();
    return true;
  } else {
    return false;
  }
}