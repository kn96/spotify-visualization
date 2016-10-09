import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Session } from 'meteor/session'
import { ReactiveDict } from 'meteor/reactive-dict'

import '../imports/startup/client/index.js'
import '../imports/lib/router.js'

import './main.html'

/* Templates */
import '../imports/ui/home/home.html'
import '../imports/ui/playlists/playlists.html'
import '../imports/ui/playlists-detail/playlists-detail.html'
import '../imports/ui/spotify/spotify.html'

import '../imports/ui/spotifyConfig.js'
import '../imports/assets/pagination/jquery.simplePagination.js'
import '../imports/assets/pagination/simplePagination.css'