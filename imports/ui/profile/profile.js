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

Template.user.onCreated( function userOnCreated () {
  this.dict = new ReactiveDict()
  const instance = Template.instance()
  Meteor.call('getUser', function (error, result) {
    instance.dict.set('userProfile', result.body)
  })
})