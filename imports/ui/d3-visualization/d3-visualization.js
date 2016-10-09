import d3 from 'd3'
import d3Color from 'd3-color'
import d3ScaleChromatic from 'd3-scale-chromatic'

Template.artistsVisualization.onCreated( function () {
  this.dict = new ReactiveDict()
  const instance = Template.instance()
  Template.instance().dict.set('displayArtistImages', false)
})


Template.artistsVisualization.events({
  'click .artist-picture-toggle'(event, instance){
    if (Template.instance().dict.get('displayArtistImages') === true) {
      console.log('true')
      $(event.target).html("Enable Artist Photos In Bubbles")
      Template.instance().dict.set('displayArtistImages', false)
    } else if (Template.instance().dict.get('displayArtistImages') === false) {
       console.log('false')
      $(event.target).html("Disable Artist Photos In Bubbles")
      Template.instance().dict.set('displayArtistImages', true)
    } else {
       console.log('else')
      $(event.target).html("Enable Artist Photos In Bubbles")
      Template.instance().dict.set('displayArtistImages', false)
    }
  }
})

Template.artistsVisualization.helpers({
  displayArtistImages() {
    if (Template.instance().dict.get('displayArtistImages') !== undefined) {
      return Template.instance().dict.get('displayArtistImages')
    } else {
      return false
    }
  },
  render(artists, width, use_images) {
    $("#dthree-container svg").detach()
    var bubblesMinWidth = 800
    var diameter = width > bubblesMinWidth ? width : bubblesMinWidth
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