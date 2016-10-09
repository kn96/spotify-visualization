FlowRouter.route('/', {
  action: function (params, queryParams) {
    BlazeLayout.render('home')
  }
})

FlowRouter.route('/login', {
  triggersEnter: [function (context, redirect) {
    var options = {
      showDialog: true,
      requestPermissions: [
        'playlist-read-private', 
        'playlist-read-collaborative'
      ] // Spotify access scopes
    }
    Meteor.loginWithSpotify(options, function (err) {
      console.log( err || "Successful login" )
    })
    redirect('/spotify')
  }]
})

FlowRouter.route('/spotify', {
	triggersEnter: [function (context, redirect) {
    if (Meteor.userId() === undefined) {
      redirect('/')
    }
  }],
  action: function (params, queryParams) {
    BlazeLayout.render('spotify')
  }
})