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
  $(".songs_wrapper").empty()
  console.log($(".songs").toArray())
  $(".songs").DataTable()
})
