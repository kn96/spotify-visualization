import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Session } from 'meteor/session'
import { ReactiveDict } from 'meteor/reactive-dict'

import '../imports/startup/client/index.js'
import '../imports/lib/router.js'

import '../imports/assets/bootstrap/css/bootstrap.min.css'
import '../imports/assets/bootstrap/js/bootstrap.min.js'

import './main.html'
import '../imports/ui/blaze.html'
import '../imports/ui/spotifyConfig.js'