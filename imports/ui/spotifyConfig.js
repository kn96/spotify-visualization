/*
 * Client configuration for songs table view
 */

import d3 from 'd3'
import d3Color from 'd3-color'
import d3ScaleChromatic from 'd3-scale-chromatic'

Template.registerHelper('arrayify', function (obj) {
    var result = []
    for (var key in obj) result.push({name:key,value:obj[key]})
    return result
})

Template.spotify.onCreated( function spotifyOnCreated() {
  this.dict = new ReactiveDict()
  const instance = Template.instance()
  Meteor.call('getPlaylists', function (error, result) {
    instance.dict.set('playlists', result)
  })
})

Template.user.onCreated( function userOnCreated () {
  this.dict = new ReactiveDict()
  const instance = Template.instance()
  Meteor.call('getUser', function (error, result) {
    instance.dict.set('userProfile', result.body)
  })
})

const throttledOnWindowResize = _.throttle(function (dict) {
  var width = $('#main-container').width()
  dict.set('containerWidth', width)
}, 200)

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

Template.spotify.onRendered( function spotifyOnRendered() {
  var dict = Template.instance().dict
  var width = $('#main-container').width()
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
                  var index = artists[j].images.length - 1
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
})

Template.spotify.events({
  'click .playlistButton'(event, instance) {
    instance.dict.set('currentArtists', undefined)
    instance.dict.set('playlistDuration', undefined)
    instance.dict.set('currentPlaylist', undefined)
    instance.dict.set('currentPlaylistTracks', undefined)
    $("#songs_wrapper").empty()

    Meteor.call('getPlaylist', event.target.id, function (error, result) {
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
  'click #artist-toggle'(event, instance) {
    if ( $(".playlist-header").hasClass("artist-retracted") ) {
      $(".playlist-header").removeClass("artist-retracted")
      $("#artist-toggle").html("Show fewer artists")
    } else {
      $(".playlist-header").addClass("artist-retracted")
      $("#artist-toggle").html("Show more artists")
    }
  }
})

Template.song.helpers({
  albumArt() {
    return this.track.album.images[2].url
  },
  artistNames() {
    var allArtists = []
    for (var j = 0, len = this.track.artists.length; j < len; j++) {
      var name = "";
      if (j == len - 1) {
        name = this.track.artists[j].name
      } else {
        name = this.track.artists[j].name + ", "
      }
      allArtists.push({ 
        name: name,
        href: this.track.artists[j].external_urls.spotify
       })
    }
    return allArtists
  },
  dateAdded() {
    var month = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    var date = new Date(this.added_at)
    return month[date.getMonth()] + " " + date.getDate().toString() + ", " + date.getFullYear().toString()
  }
})

Template.song.events({
  'click .name, click .artist, click .album'(event, instance){
    $(event.target).toggleClass("expanded")
    $(event.target).siblings().toggleClass("expanded")
  }
})

Template.songsTable.onRendered( function () {
  $("#songs_wrapper").empty()
  console.log($("#songs").toArray())
  $("#songs").DataTable()
})

Template.artistSongCount.helpers({
  name() {
    return this[0]
  },
  count() {
    return this[1].count
  }
})

Template.artistSongCount.events({
  'mouseenter .artistCount'(event, instance){
    $(event.target).addClass("artistCountHover")
    $(event.target).children(".artistCountNumber").addClass("artistCountNumberHover")
  },
  'mouseleave .artistCount'(event, instance){
    $(event.target).removeClass("artistCountHover")
    $(event.target).children(".artistCountNumber").removeClass("artistCountNumberHover")
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

Template.artistsVisualization.helpers({
  render(artists, width, use_images) {
    $("#dthree-container svg").detach()
    var diameter = width
    var format = d3.format(",d")
    var radiusInterpolator = d3.interpolateNumber(30, 200)
    var colorInterpolator = d3.interpolateRgb(d3.rgb(181, 237, 255), d3.rgb(0, 47, 255))
    var stripInvalidIdCharacters = /[^A-Za-z_:.-]+/g

    var counts = []
    var data = {
      children: []
    }
    for (var j = 0; j < artists.length; j++) {
      counts.push(artists[j][1].count)
      var child = {
        name: artists[j][0],
        value: artists[j][1].count,
        imageUrl: artists[j][1].image,
        imgWidth: artists[j][1].imgWidth,
        imgHeight: artists[j][1].imgHeight
      }
      data.children.push(child)
    }

    var hierarchy = d3.hierarchy(data)
              .sum(function(d) { return d.value })
              .sort(function(a, b) { return  b.value - a.value })

    var maxCount = Math.max(...counts)
    var minCount = Math.min(...counts)

    var bubble = d3.pack()
        .size([diameter, diameter])
        .padding(4)

    bubble(hierarchy)

    var svg = d3.select("#dthree-container").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble")
    if (use_images) {
      d3.select("#dthree-container svg").append("defs").selectAll("pattern")
       .data(function () { return hierarchy.children })
       .enter()
       .append("pattern")
       .attr("id", function (d) { return d.data.name.replace(stripInvalidIdCharacters, '') + "-img" })
       .attr("x", "0%")
       .attr("y", "0%")
       .attr("height", "100%")
       .attr("width", "100%")
       .attr("viewBox", function (d) { return "0 0 " + d.data.imgWidth + " " + d.data.imgHeight })
       .attr("preserveAspectRatio", "xMinYMin slice")
       .append("image")
       .attr("x", "0%")
       .attr("y", "0%")
       .attr("width", function (d) { return d.data.imgWidth })
       .attr("height", function (d) { return d.data.imgHeight })
       .attr("xlink:href", function (d) { return d.data.imageUrl })
    }

    var node = svg.selectAll(".node")
      .data(hierarchy.descendants().slice(1))
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y + ")" })
      .attr("title", function(d) { 
          return d.data.name + ": " + format(d.value) + (d.value !== 1 ? " songs" : " song") })

    node.filter(function (d) { return d.data })
        .append("circle")
        .attr("r", function (d) { return d.r })
        .attr("fill", function (d) { 
          if (use_images && ( d.data.imageUrl !== undefined || d.data.imageUrl !== "" ) ) {
            return "url(#" + d.data.name.replace(stripInvalidIdCharacters, '') + "-img" + ")"
          } else {
            return colorInterpolator(d.value / maxCount) 
          }
        })

    node.filter(function (d) { return d.data })
        .append("text")
        .text(function(d) { return d.data.name; })
        .attr("style", function(d) {
          var style = "font-size: " + Math.min(2 * d.r, (2 * d.r -  8) / this.getComputedTextLength() * 14) + "px; "
          if (use_images && ( d.data.imageUrl !== undefined || d.data.imageUrl !== "" ) ) {
            style = style + "text-shadow: 1px 3px 3px rgba(0,0,0,0.8)"
          }
          return style
                 
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("width", function (d) { return 2 * d.r })
        .attr("fill", function (d) { 
          if (use_images && (d.data.imageUrl !== undefined || d.data.imageUrl !== "" ) ) {
            return "#EEE"
          } else {
            return (d.value / maxCount > 0.5 ? "#EEE" : "#224")
          }
        })

    $('.node').hover(function(){
      // Hover over code
      var title = $(this).attr('title')
      $(this).data('tipText', title).removeAttr('title')
      $('<p class="tooltipDisplay"></p>')
      .text(title)
      .appendTo('body')
      .fadeIn()
    }, function() {
      // Hover out code
      $(this).attr('title', $(this).data('tipText'))
      $('.tooltipDisplay').fadeOut()
    }).mousemove(function(e) {
      var mousex = e.pageX + 20 //Get X coordinates
      var mousey = e.pageY + 10 //Get Y coordinates
      $('.tooltipDisplay')
      .css({ top: mousey, left: mousex })
    })
  }
})