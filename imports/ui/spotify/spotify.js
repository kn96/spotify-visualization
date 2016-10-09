var convertToLongDuration = function (durationSeconds) {
  const secondsPerYear = 31536000
  const secondsPerDay = 86400
  const secondsPerHour = 3600
  const secondsPerMinute = 60
  var duration = ""
  if (durationSeconds > secondsPerYear) {
    var years = Math.floor(durationSeconds / secondsPerYear)
    duration = duration + years.toString() + (years > 1 ? " years" : " year")
    durationSeconds -= (years * secondsPerYear)
  }
  if (durationSeconds > secondsPerDay) {
    var days = Math.floor(durationSeconds / secondsPerDay)
    if (duration.length > 0) {
      duration = duration + ", "
    }
    duration = duration + days.toString() + (days > 1 ? " days" : " day")
    durationSeconds -= (days * secondsPerDay)
  }
  if (durationSeconds > secondsPerHour) {
    var hours = Math.floor(durationSeconds / secondsPerHour)
    if (duration.length > 0) {
      duration = duration + ", "
    }
    duration = duration + hours.toString() + (hours > 1 ? " hours" : " hour")
    durationSeconds -= (hours * secondsPerHour)
  }
  if (durationSeconds > secondsPerMinute) {
    var minutes = Math.floor(durationSeconds / secondsPerMinute)
    if (duration.length > 0) {
      duration = duration + ", "
    }
    duration = duration + minutes.toString() + (minutes > 1 ? " minutes" : " minute")
    durationSeconds -= (minutes * secondsPerMinute)
  }
  if (durationSeconds > 0) {
    if (duration.length > 0) {
      duration = duration + ", "
    }
    duration = duration + durationSeconds.toString() + (durationSeconds > 1 ? " seconds" : " second")
  }
  return duration
}

const throttledOnWindowResize = _.throttle(function (dict) {
  var width = $('.songs-container').width()
  dict.set('containerWidth', width)
}, 200)


Template.spotify.onCreated( function spotifyOnCreated() {
  this.dict = new ReactiveDict()
  const instance = Template.instance()
  Meteor.call('getPlaylists', function (error, result) {
    instance.dict.set('playlists', result)
  })
})

Template.spotify.onRendered( function spotifyOnRendered() {
  var dict = Template.instance().dict
  var width = $('.songs-container').width()
  dict.set('containerWidth', width)
  $(window).resize(function () {
    throttledOnWindowResize(dict)
  })
  console.log("width set to " + width)
})

Template.spotify.onDestroyed(function spotifyOnDestroyed() {
  $(window).off('resize')
})

Template.spotify.helpers({
  hasCurrentPlaylist() {
    if (Template.instance().dict.get('currentPlaylist')) {
      return true
    } else {
      return false
    }
  },
  playlists() {
    return Template.instance().dict.get('playlists')
  },
  playlistName() {
    if (Template.instance().dict.get('currentPlaylistTracks') !== undefined) {
      return Template.instance().dict.get('currentPlaylist').name
    }
  },
  largeImage() {
    if (Template.instance().dict.get('currentPlaylistTracks') !== undefined) {
      if (Template.instance().dict.get('currentPlaylist').images[0] !== undefined) {
        return Template.instance().dict.get('currentPlaylist').images[0].url
      }
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
  },
  playlistDuration() {
    if (Template.instance().dict.get('currentPlaylistTracks') !== undefined) {
      if (Template.instance().dict.get('playlistDuration') === undefined) {
        var tracks = Template.instance().dict.get('currentPlaylistTracks')
        var duration = 0
        for (var j = 0; j < tracks.length; j++) {
          duration += tracks[j].track.duration_ms
        }
        duration = Math.round(duration / 1000)
        duration = convertToLongDuration(duration)
        Template.instance().dict.set('playlistDuration', duration)
        return duration
      } else {
        return Template.instance().dict.get('playlistDuration')
      }
    }
  },
  artists() {
    if (Template.instance().dict.get('currentPlaylistTracks') !== undefined) {
      if (Template.instance().dict.get('currentArtists') !== undefined) {
        return Template.instance().dict.get('currentArtists')
      } else {
        var artistArray = Template.instance().dict.get('currentPlaylistTracks')
        var artistCount = {}
        var artistIds = []
        for (var j = 0; j < artistArray.length; j++) {
          for(var k = 0; k < artistArray[j].track.artists.length; k++) {
            if (artistCount[artistArray[j].track.artists[k].name]) {
              artistCount[artistArray[j].track.artists[k].name].count += 1
            } else {
              artistCount[artistArray[j].track.artists[k].name] = {
                count: 1,
                image: artistArray[j].track.album.images[0].url,
                imgWidth: artistArray[j].track.album.images[0].width,
                imgHeight: artistArray[j].track.album.images[0].height,
              }
              artistIds.push({
                name: artistArray[j].track.artists[k].name,
                id: artistArray[j].track.artists[k].id,
              })
            }
          }
        }
        var instance = Template.instance()
        for (var j = 0; j < artistIds.length; j = j + 50) {
          var batchEnd = j + 49
          if (batchEnd > artistIds.length) {
            batchEnd = artistIds.length
          }
          var ids = []
          for (var i = 0; i < batchEnd; i++) {
            ids.push(artistIds[i].id);
          }
          Meteor.call('getArtists', ids, function (error, result) {
            if (result !== undefined && result.body !== undefined) {
              var artists = result.body.artists
              for (var j = 0; j < artists.length; j++) {
                if (artists[j].images.length > 0) {
                  var index = artists[j].images.length >= 2 ? 1 : 0
                  var artist = artistCount[artists[j].name]
                  artist.image = artists[j].images[index].url
                  artist.imgWidth = artists[j].images[index].width
                  artist.imgHeight = artists[j].images[index].height
                }
              }
              if (batchEnd === artistIds.length) {
                instance.dict.set('currentArtists',
                  _.sortBy(_.pairs(artistCount), function(item) {
                    return item[1].count
                  }).reverse()
                )
              }
            }
          })
        }
        Template.instance().dict.set('artistIds', artistIds)
      }
    }
  },
  artistCount() {
    if (Template.instance().dict.get('currentArtists') !== undefined) {
      return Template.instance().dict.get('currentArtists').length
    }
  },
  tableWidth() {
    return Template.instance().dict.get('containerWidth')
  },
  userLoaded() {
    if (Meteor.userId() != undefined || Meteor.userId() != null) {
      return true;
    } else {
      return false;
    }
  }
})

Template.spotify.events({
  'click .playlistButton'(event, instance) {
    instance.dict.set('currentArtists', undefined)
    instance.dict.set('playlistDuration', undefined)
    instance.dict.set('currentPlaylist', undefined)
    instance.dict.set('currentPlaylistTracks', undefined)
    instance.dict.set('displayArtistImages', false)
    $("#songs_wrapper").empty()

    Meteor.call('getPlaylist', event.target.id, function (error, result) {
      console.log(event.target.id)
      instance.dict.set('currentPlaylist', result)
      //instance.dict.set('currentPlaylistTracks', [])
    })
    Meteor.call('getPlaylistTracks', event.target.id, function (error, result) {
      instance.dict.set('currentPlaylistTracks', result)
    })
  },
  'click .sort-toggle'(event, instance) {
    // Prevents case-sensitive sorting, excludes special characters and spaces
    var sortDataCleanup = function (name) {
      return name.toLowerCase().match(/(?:^the |)([\w\d\s,]+)/)[1]
    }
    var sortLookup = {
      "name-sort": function (item) {
        return sortDataCleanup(item.track.name)
      },
      "artist-sort": function (item) {
        var artists = ""
        for (var j = 0; j < item.track.artists.length; j++) {
          artists = artists + item.track.artists[j].name
        }
        artists = sortDataCleanup(artists)
        return artists
      },
      "album-sort": function (item) {
        return sortDataCleanup(item.track.album.name)
      },
      "date-sort": function (item) {
        return sortDataCleanup(item.added_at)
      }
    }
    var id = $(event.target).attr("id")
    var reverse = $(event.target).hasClass("reverseSort")
    if (reverse) {
      $(".sort-toggle").removeClass("reverseSort")
                       .removeClass("glyphicon-triangle-bottom")
                       .addClass("glyphicon-triangle-top")
    } else {
      $(event.target).addClass("reverseSort")
                     .removeClass("glyphicon-triangle-top")
                     .addClass("glyphicon-triangle-bottom")
      $(".sort-toggle").not($(event.target))
                       .removeClass("glyphicon-triangle-bottom")
                       .addClass("glyphicon-triangle-top")
    }
    Meteor.call('getSorts', function (error, result) {
      var sorted = _.sortBy(instance.dict.get('currentPlaylistTracks'),
                function(item) { return sortLookup[id](item) })
      if (reverse) {
        sorted.reverse()
      }
      instance.dict.set('currentPlaylistTracks', sorted)
    })
  },
  'click .artist-toggle'(event, instance) {
    if ( $(".playlist-header").hasClass("artist-retracted") ) {
      $(".playlist-header").removeClass("artist-retracted")
      $(".artist-toggle").html("Show fewer artists")
    } else {
      $(".playlist-header").addClass("artist-retracted")
      $(".artist-toggle").html("Show more artists")
    }
  }
})
