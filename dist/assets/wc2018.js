"use strict";



define('wc2018/app', ['exports', 'wc2018/resolver', 'ember-load-initializers', 'wc2018/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
define('wc2018/components/live-match', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['layout__box', 'o__has-rows', 'card', 'u__mb__20']
  });
});
define('wc2018/components/live-matches', ['exports', 'wc2018/components/match-list'], function (exports, _matchList) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _matchList.default.extend();
});
define('wc2018/components/match-component', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['layout__box', 'o__has-rows', 'u__pad__20']
  });
});
define('wc2018/components/match-list', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({

    matchService: Ember.inject.service(),

    filtering: 'future',

    matches: Ember.computed('matchService.matches.[]', function () {
      return this.get('matchService.matches').filter(match => match.status === this.get('filtering'));
    }),

    matchesFilteredByPlayer: Ember.computed('matches.[]', 'filterPlayer', function () {
      let filterPlayer = this.get('filterPlayer');
      if (filterPlayer) {
        return this.get('matches').filter(match => {
          return match.home_team.player_name === filterPlayer || match.away_team.player_name === filterPlayer;
        });
      } else {
        return this.get('matches');
      }
    })

  });
});
define('wc2018/components/match-stats', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['layout__box', 'o__flexes-to-1', 'o__has-rows', 'stat-table'],
    classNameBindings: ['hasNoEvents:u__hidden'],
    hasNoEvents: Ember.computed.empty('events'),
    events: Ember.computed('match.{home_team_events,away_team_events}', function () {
      this.get('match.home_team_events').setEach('side', 'home');
      this.get('match.away_team_events').setEach('side', 'away');
      let events = this.get('match.home_team_events').concat(this.get('match.away_team_events'));
      events = this.dedupEvents(events);
      return events.sortBy('integerTime');
    }),

    dedupEvents(events) {
      events = events.map(event => {
        let time = event.time.replace(`'`, '').split('+');
        let integerTime = Number.parseInt(time[0]) + (Number.parseInt(time[1]) || 0);
        event.integerTime = integerTime;
        return event;
      });
      events = events.reduce((accumulator, event) => {
        let lastEvent = accumulator.get('lastObject') || {};
        if (lastEvent.player == event.player && lastEvent.type_of_event == event.type_of_event && Math.abs(lastEvent.integerTime - event.integerTime) <= 1) {
          console.log(`Duplicate Event:`);
          console.log(`${lastEvent.player} ${lastEvent.type_of_event} ${lastEvent.time}`);
          console.log(`${event.player} ${event.type_of_event} ${event.time}`);
        } else {
          accumulator.pushObject(event);
        }
        return accumulator;
      }, []);
      return events;
    }
  });
});
define('wc2018/components/past-match', ['exports', 'wc2018/components/upcoming-match'], function (exports, _upcomingMatch) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _upcomingMatch.default.extend({
    classNames: ['past-match']
  });
});
define('wc2018/components/past-matches', ['exports', 'wc2018/components/match-list'], function (exports, _matchList) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _matchList.default.extend({
    filtering: 'completed',
    isOpen: false,
    actions: {
      toggle() {
        this.toggleProperty('isOpen');
      }
    }
  });
});
define('wc2018/components/pool-table-row', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    tagName: 'tr',
    classNames: ['pool-table-row'],
    classNameBindings: ['isFilteringByPlayer:o__is-filtering'],
    isFilteringByPlayer: Ember.computed('player', 'filterPlayer', function () {
      return this.get('filterPlayer') === this.get('player.name');
    }),
    click() {
      this.get('toggleFilter')(this.get('player.name'));
    }
  });
});
define('wc2018/components/pool-table', ['exports', 'ember-concurrency'], function (exports, _emberConcurrency) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const STATISTICS = ['wins', 'draws', 'losses', 'goals_for', 'goals_against', 'games_played', 'goal_differential', 'points'];

  exports.default = Ember.Component.extend({
    classNames: ['card', 'o__no-padding', 'layout__box', 'o__has-rows', 'pool-table', 'u__mb__20'],
    ajax: Ember.inject.service(),
    matchService: Ember.inject.service(),

    init() {
      this._super(...arguments);
      this.set('sortedPlayers', []);
    },

    didInsertElement() {
      this._super(...arguments);
      this.get('fetchPoolResults').perform();
    },

    upcomingTeams: Ember.computed('matchService.matches.[]', function () {
      let matches = this.get('matchService.matches').rejectBy('status', 'completed');
      let homeTeams = matches.mapBy('home_team.country');
      let awayTeams = matches.mapBy('away_team.country');
      return homeTeams.concat(awayTeams);
    }),

    poolPlayers: Ember.computed('sortedPlayers.[]', 'currentlyPlayingPlayers.[]', function () {
      let sortedPlayers = this.get('sortedPlayers');
      sortedPlayers.forEach(player => {
        Ember.set(player, 'currentlyPlaying', this.get('currentlyPlayingPlayers').includes(player.name));
      });
      return sortedPlayers;
    }),

    currentlyPlayingPlayers: Ember.computed('matchService.liveMatches.[]', function () {
      let matchService = this.get('matchService');
      let livePlayers = new Set();
      matchService.get('liveMatches').forEach(match => {
        livePlayers.add(matchService.playerNameForCountry(match.home_team_country));
        livePlayers.add(matchService.playerNameForCountry(match.away_team_country));
      });
      return Array.from(livePlayers);
    }),

    fetchPoolResults: (0, _emberConcurrency.task)(function* () {
      let data = yield this.get('ajax').request('https://world-cup-json.herokuapp.com/teams/group_results');
      data = data.mapBy('ordered_teams');
      data = data.reduce((accumulator, data) => accumulator.pushObjects(data), []);
      let players = this.get('players');
      players.forEach(player => {
        STATISTICS.forEach(statistic => player[statistic] = 0);
      });
      data.forEach(teamResult => {
        let player = this.get('matchService.teamToPlayerSet')[teamResult.country];
        STATISTICS.forEach(statistic => {
          if (player) {
            player[statistic] += teamResult[statistic];
          }
        });
      });
      let sortedPlayers = players.sort((a, b) => this._comparePlayers(a, b));
      this.set('sortedPlayers', sortedPlayers);
    }),

    _comparePlayers(a, b) {
      if (a.points < b.points) return 1;
      if (a.points > b.points) return -1;

      if (a.goal_differential < b.goal_differential) return 1;
      if (a.goal_differential > b.goal_differential) return -1;

      if (a.goals_for < b.goals_for) return 1;
      if (a.goals_for > b.goals_for) return -1;

      if (a.won < b.won) return 1;
      if (a.won > b.won) return -1;

      return 0;
    }
  });
});
define('wc2018/components/upcoming-match', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['layout__box', 'o__has-rows', 'card', 'u__mb__20']
  });
});
define('wc2018/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _welcomePage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
define('wc2018/controllers/sweepstake', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Controller.extend({
    actions: {
      toggleFilter(player) {
        if (this.get('filterPlayer') === player) {
          this.set('filterPlayer', null);
        } else {
          this.set('filterPlayer', player);
        }
      }
    }
  });
});
define("wc2018/data/matches", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = [{
    "name": 1,
    "type": "group",
    "home_team": 1,
    "away_team": 2,
    "home_result": 5,
    "away_result": 0,
    "date": "2018-06-14T18:00:00+03:00",
    "stadium": 1,
    "channels": [4, 6, 13, 17, 20, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group A"
  }, {
    "name": 2,
    "type": "group",
    "home_team": 3,
    "away_team": 4,
    "home_result": 0,
    "away_result": 1,
    "date": "2018-06-15T17:00:00+05:00",
    "stadium": 12,
    "channels": [3, 6, 14, 17, 20, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group A"
  }, {
    "name": 3,
    "type": "group",
    "home_team": 5,
    "away_team": 6,
    "home_result": 3,
    "away_result": 3,
    "date": "2018-06-15T21:00:00+03:00",
    "stadium": 11,
    "channels": [3, 7, 13, 15, 17, 20, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group B"
  }, {
    "name": 4,
    "type": "group",
    "home_team": 7,
    "away_team": 8,
    "home_result": 0,
    "away_result": 1,
    "date": "2018-06-15T18:00:00+03:00",
    "stadium": 3,
    "channels": [4, 6, 13, 17, 21, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group B"
  }, {
    "name": 5,
    "type": "group",
    "home_team": 9,
    "away_team": 10,
    "home_result": 2,
    "away_result": 1,
    "date": "2018-06-16T13:00:00+03:00",
    "stadium": 5,
    "channels": [3, 6, 14, 15, 18, 21, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group C"
  }, {
    "name": 6,
    "type": "group",
    "home_team": 11,
    "away_team": 12,
    "home_result": 0,
    "away_result": 1,
    "date": "2018-06-16T19:00:00+03:00",
    "stadium": 9,
    "channels": [3, 6, 14, 15, 18, 21, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group C"
  }, {
    "name": 7,
    "type": "group",
    "home_team": 13,
    "away_team": 14,
    "home_result": 1,
    "away_result": 1,
    "date": "2018-06-16T16:00:00+03:00",
    "stadium": 2,
    "channels": [4, 6, 13, 18, 20, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group D"
  }, {
    "name": 8,
    "type": "group",
    "home_team": 15,
    "away_team": 16,
    "home_result": 2,
    "away_result": 0,
    "date": "2018-06-16T21:00:00+02:00",
    "stadium": 4,
    "channels": [4, 6, 14, 18, 15, 20, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group D"
  }, {
    "name": 9,
    "type": "group",
    "home_team": 17,
    "away_team": 18,
    "home_result": 1,
    "away_result": 1,
    "date": "2018-06-17T21:00:00+03:00",
    "stadium": 10,
    "channels": [4, 6, 14, 18, 20, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group E"
  }, {
    "name": 10,
    "type": "group",
    "home_team": 19,
    "away_team": 20,
    "home_result": 0,
    "away_result": 1,
    "date": "2018-06-17T16:00:00+04:00",
    "stadium": 7,
    "channels": [4, 6, 13, 18, 20, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group E"
  }, {
    "name": 11,
    "type": "group",
    "home_team": 21,
    "away_team": 22,
    "home_result": 0,
    "away_result": 1,
    "date": "2018-06-17T18:00:00+03:00",
    "stadium": 1,
    "channels": [3, 6, 14, 18, 21, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group F"
  }, {
    "name": 12,
    "type": "group",
    "home_team": 23,
    "away_team": 24,
    "home_result": 1,
    "away_result": 0,
    "date": "2018-06-18T15:00:00+03:00",
    "stadium": 6,
    "channels": [4, 6, 14, 17, 20, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group F"
  }, {
    "name": 13,
    "type": "group",
    "home_team": 25,
    "away_team": 26,
    "home_result": 3,
    "away_result": 0,
    "date": "2018-06-18T18:00:00+03:00",
    "stadium": 11,
    "channels": [3, 6, 14, 17, 21, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group G"
  }, {
    "name": 14,
    "type": "group",
    "home_team": 27,
    "away_team": 28,
    "home_result": 1,
    "away_result": 2,
    "date": "2018-06-18T21:00:00+03:00",
    "stadium": 8,
    "channels": [3, 6, 14, 17, 20, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group G"
  }, {
    "name": 15,
    "type": "group",
    "home_team": 29,
    "away_team": 30,
    "home_result": 1,
    "away_result": 2,
    "date": "2018-06-19T18:00:00+03:00",
    "stadium": 2,
    "channels": [4, 6, 13, 18, 15, 20, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group H"
  }, {
    "name": 16,
    "type": "group",
    "home_team": 31,
    "away_team": 32,
    "home_result": 1,
    "away_result": 2,
    "date": "2018-06-19T15:00:00+03:00",
    "stadium": 9,
    "channels": [3, 6, 14, 18, 20, 22],
    "finished": true,
    "matchday": 1,
    "stage": "Group H"
  }, {
    "name": 17,
    "type": "group",
    "home_team": 1,
    "away_team": 3,
    "home_result": 3,
    "away_result": 1,
    "date": "2018-06-19T21:00:00+03:00",
    "stadium": 3,
    "channels": [3, 6, 13, 17, 15, 21, 22],
    "finished": true,
    "matchday": 2,
    "stage": "Group A"
  }, {
    "name": 18,
    "type": "group",
    "home_team": 4,
    "away_team": 2,
    "home_result": 1,
    "away_result": 0,
    "date": "2018-06-20T18:00:00+03:00",
    "stadium": 10,
    "channels": [3, 6, 13, 17, 21, 22],
    "finished": true,
    "matchday": 2,
    "stage": "Group A"
  }, {
    "name": 19,
    "type": "group",
    "home_team": 5,
    "away_team": 7,
    "home_result": 1,
    "away_result": 0,
    "date": "2018-06-20T15:00:00+03:00",
    "stadium": 1,
    "channels": [3, 6, 14, 15, 17, 20, 22],
    "finished": true,
    "matchday": 2,
    "stage": "Group B"
  }, {
    "name": 20,
    "type": "group",
    "home_team": 8,
    "away_team": 6,
    "home_result": 0,
    "away_result": 1,
    "date": "2018-06-20T21:00:00+03:00",
    "stadium": 5,
    "channels": [4, 7, 13, 15, 17, 20, 21],
    "finished": true,
    "matchday": 2,
    "stage": "Group B"
  }, {
    "name": 21,
    "type": "group",
    "home_team": 9,
    "away_team": 11,
    "home_result": 1,
    "away_result": 0,
    "date": "2018-06-21T20:00:00+05:00",
    "stadium": 12,
    "channels": [4, 6, 13, 15, 18, 21, 22],
    "finished": true,
    "matchday": 2,
    "stage": "Group C"
  }, {
    "name": 22,
    "type": "group",
    "home_team": 12,
    "away_team": 10,
    "home_result": 1,
    "away_result": 1,
    "date": "2018-06-21T16:00:00+04:00",
    "stadium": 7,
    "channels": [4, 6, 14, 15, 18, 20, 22],
    "finished": true,
    "matchday": 2,
    "stage": "Group C"
  }, {
    "name": 23,
    "type": "group",
    "home_team": 13,
    "away_team": 15,
    "home_result": 0,
    "away_result": 3,
    "date": "2018-06-21T21:00:00+03:00",
    "stadium": 6,
    "channels": [3, 6, 13, 18, 20, 22],
    "finished": true,
    "matchday": 2,
    "stage": "Group D"
  }, {
    "name": 24,
    "type": "group",
    "home_team": 16,
    "away_team": 14,
    "home_result": 2,
    "away_result": 0,
    "date": "2018-06-22T18:00:00+03:00",
    "stadium": 8,
    "channels": [3, 6, 13, 18, 15, 21, 22],
    "finished": true,
    "matchday": 2,
    "stage": "Group D"
  }, {
    "name": 25,
    "type": "group",
    "home_team": 17,
    "away_team": 19,
    "home_result": 2,
    "away_result": 0,
    "date": "2018-06-22T15:00:00+03:00",
    "stadium": 3,
    "channels": [4, 6, 14, 18, 15, 20, 22],
    "finished": true,
    "matchday": 2,
    "stage": "Group E"
  }, {
    "name": 26,
    "type": "group",
    "home_team": 20,
    "away_team": 18,
    "home_result": 1,
    "away_result": 0,
    "date": "2018-06-22T20:00:00+02:00",
    "stadium": 4,
    "channels": [3, 6, 13, 18, 15, 20, 22],
    "finished": false,
    "matchday": 2,
    "stage": "Group E"
  }, {
    "name": 27,
    "type": "group",
    "home_team": 21,
    "away_team": 23,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-23T21:00:00+03:00",
    "stadium": 11,
    "channels": [4, 6, 13, 15, 17, 20, 22],
    "finished": false,
    "matchday": 2,
    "stage": "Group F"
  }, {
    "name": 28,
    "type": "group",
    "home_team": 24,
    "away_team": 22,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-23T18:00:00+03:00",
    "stadium": 10,
    "channels": [4, 6, 13, 15, 17, 21, 22],
    "finished": false,
    "matchday": 2,
    "stage": "Group F"
  }, {
    "name": 29,
    "type": "group",
    "home_team": 25,
    "away_team": 27,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-23T15:00:00+03:00",
    "stadium": 2,
    "channels": [3, 6, 13, 15, 17, 20, 22],
    "finished": false,
    "matchday": 2,
    "stage": "Group G"
  }, {
    "name": 30,
    "type": "group",
    "home_team": 28,
    "away_team": 26,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-24T15:00:00+03:00",
    "stadium": 6,
    "channels": [3, 6, 14, 15, 17, 20, 22],
    "finished": false,
    "matchday": 2,
    "stage": "Group G"
  }, {
    "name": 31,
    "type": "group",
    "home_team": 29,
    "away_team": 31,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-24T20:00:00+02:00",
    "stadium": 5,
    "channels": [4, 6, 13, 15, 17, 20, 22],
    "finished": false,
    "matchday": 2,
    "stage": "Group H"
  }, {
    "name": 32,
    "type": "group",
    "home_team": 32,
    "away_team": 30,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-24T18:00:00+03:00",
    "stadium": 12,
    "channels": [3, 6, 13, 15, 17, 20, 22],
    "finished": false,
    "matchday": 2,
    "stage": "Group H"
  }, {
    "name": 33,
    "type": "group",
    "home_team": 4,
    "away_team": 1,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-25T18:00:00+04:00",
    "stadium": 7,
    "channels": [4, 6, 13, 18, 15, 20, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group A"
  }, {
    "name": 34,
    "type": "group",
    "home_team": 2,
    "away_team": 3,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-25T17:00:00+03:00",
    "stadium": 8,
    "channels": [5, 6, 14, 18, 15, 21, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group A"
  }, {
    "name": 35,
    "type": "group",
    "home_team": 8,
    "away_team": 5,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-25T21:00:00+03:00",
    "stadium": 9,
    "channels": [3, 6, 13, 18, 21, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group B"
  }, {
    "name": 36,
    "type": "group",
    "home_team": 6,
    "away_team": 7,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-25T20:00:00+02:00",
    "stadium": 4,
    "channels": [3, 7, 14, 18, 21, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group B"
  }, {
    "name": 37,
    "type": "group",
    "home_team": 12,
    "away_team": 9,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-26T17:00:00+03:00",
    "stadium": 1,
    "channels": [4, 6, 13, 15, 17, 20, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group C"
  }, {
    "name": 38,
    "type": "group",
    "home_team": 10,
    "away_team": 11,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-26T17:00:00+03:00",
    "stadium": 11,
    "channels": [5, 6, 14, 16, 19, 21, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group C"
  }, {
    "name": 39,
    "type": "group",
    "home_team": 16,
    "away_team": 13,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-26T21:00:00+03:00",
    "stadium": 3,
    "channels": [3, 6, 13, 15, 17, 20, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group D"
  }, {
    "name": 40,
    "type": "group",
    "home_team": 14,
    "away_team": 15,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-26T21:00:00+03:00",
    "stadium": 10,
    "channels": [3, 6, 14, 17, 21, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group D"
  }, {
    "name": 41,
    "type": "group",
    "home_team": 20,
    "away_team": 17,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-27T21:00:00+03:00",
    "stadium": 2,
    "channels": [4, 6, 13, 18, 15, 20, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group E"
  }, {
    "name": 42,
    "type": "group",
    "home_team": 18,
    "away_team": 19,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-27T21:00:00+03:00",
    "stadium": 6,
    "channels": [5, 6, 14, 18, 15, 21, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group E"
  }, {
    "name": 43,
    "type": "group",
    "home_team": 24,
    "away_team": 21,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-27T17:00:00+03:00",
    "stadium": 5,
    "channels": [3, 6, 14, 18, 15, 20, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group F"
  }, {
    "name": 44,
    "type": "group",
    "home_team": 22,
    "away_team": 23,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-27T19:00:00+05:00",
    "stadium": 12,
    "channels": [3, 6, 13, 18, 21, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group F"
  }, {
    "name": 45,
    "type": "group",
    "home_team": 28,
    "away_team": 25,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-28T20:00:00+02:00",
    "stadium": 4,
    "channels": [4, 6, 13, 15, 17, 20, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group G"
  }, {
    "name": 46,
    "type": "group",
    "home_team": 26,
    "away_team": 27,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-28T21:00:00+03:00",
    "stadium": 9,
    "channels": [5, 6, 14, 19, 16, 21, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group G"
  }, {
    "name": 47,
    "type": "group",
    "home_team": 32,
    "away_team": 29,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-28T17:00:00+03:00",
    "stadium": 8,
    "channels": [3, 6, 14, 15, 17, 20, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group H"
  }, {
    "name": 48,
    "type": "group",
    "home_team": 30,
    "away_team": 31,
    "home_result": null,
    "away_result": null,
    "date": "2018-06-28T18:00:00+04:00",
    "stadium": 7,
    "channels": [3, 6, 13, 17, 21, 22],
    "finished": false,
    "matchday": 3,
    "stage": "Group H"
  }, {
    "name": 49,
    "type": "qualified",
    "home_team": "winner_a",
    "away_team": "runner_b",
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-06-30T17:00:00+03:00",
    "stadium": 11,
    "channels": [4, 13, 15],
    "finished": false,
    "matchday": 4,
    "stage": "Round of 16"
  }, {
    "name": 50,
    "type": "qualified",
    "home_team": "winner_c",
    "away_team": "runner_d",
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-06-30T21:00:00+03:00",
    "stadium": 5,
    "channels": [4, 6, 13, 15],
    "finished": false,
    "matchday": 4,
    "stage": "Round of 16"
  }, {
    "name": 51,
    "type": "qualified",
    "home_team": "winner_b",
    "away_team": "runner_a",
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-01T17:00:00+03:00",
    "stadium": 1,
    "channels": [3, 13, 15],
    "finished": false,
    "matchday": 4,
    "stage": "Round of 16"
  }, {
    "name": 52,
    "type": "qualified",
    "home_team": "winner_d",
    "away_team": "runner_c",
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-01T21:00:00+03:00",
    "stadium": 6,
    "channels": [4, 6, 13, 15],
    "finished": false,
    "matchday": 4,
    "stage": "Round of 16"
  }, {
    "name": 53,
    "type": "qualified",
    "home_team": "winner_e",
    "away_team": "runner_f",
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-02T18:00:00+04:00",
    "stadium": 7,
    "channels": [3, 6, 14, 15],
    "finished": false,
    "matchday": 4,
    "stage": "Round of 16"
  }, {
    "name": 54,
    "type": "qualified",
    "home_team": "winner_g",
    "away_team": "runner_h",
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-02T21:00:00+03:00",
    "stadium": 10,
    "channels": [3, 6, 13, 16],
    "finished": false,
    "matchday": 4,
    "stage": "Round of 16"
  }, {
    "name": 55,
    "type": "qualified",
    "home_team": "winner_f",
    "away_team": "runner_e",
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-03T17:00:00+03:00",
    "stadium": 3,
    "channels": [4, 6, 14, 16],
    "finished": false,
    "matchday": 4,
    "stage": "Round of 16"
  }, {
    "name": 56,
    "type": "qualified",
    "home_team": "winner_h",
    "away_team": "runner_g",
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-03T21:00:00+03:00",
    "stadium": 2,
    "channels": [3, 6, 13, 15],
    "finished": false,
    "matchday": 4,
    "stage": "Round of 16"
  }, {
    "name": 57,
    "type": "winner",
    "home_team": 49,
    "away_team": 50,
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-06T17:00:00+03:00",
    "stadium": 6,
    "channels": [3, 14, 15],
    "finished": false,
    "matchday": 5,
    "stage": "Quarter-finals"
  }, {
    "name": 58,
    "type": "winner",
    "home_team": 53,
    "away_team": 54,
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-06T21:00:00+03:00",
    "stadium": 5,
    "channels": [3, 14, 15],
    "finished": false,
    "matchday": 5,
    "stage": "Quarter-finals"
  }, {
    "name": 59,
    "type": "winner",
    "home_team": 51,
    "away_team": 52,
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-07T21:00:00+03:00",
    "stadium": 11,
    "channels": [4, 13, 16],
    "finished": false,
    "matchday": 5,
    "stage": "Quarter-finals"
  }, {
    "name": 60,
    "type": "winner",
    "home_team": 55,
    "away_team": 56,
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-07T18:00:00+04:00",
    "stadium": 7,
    "channels": [4, 13, 16],
    "finished": false,
    "matchday": 5,
    "stage": "Quarter-finals"
  }, {
    "name": 61,
    "type": "winner",
    "home_team": 57,
    "away_team": 58,
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-10T21:00:00+03:00",
    "stadium": 3,
    "channels": [4, 13, 16],
    "finished": false,
    "matchday": 6,
    "stage": "Semi-finals"
  }, {
    "name": 62,
    "type": "winner",
    "home_team": 59,
    "away_team": 60,
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-11T21:00:00+03:00",
    "stadium": 1,
    "channels": [3, 13, 15],
    "finished": false,
    "matchday": 6,
    "stage": "Semi-finals"
  }, {
    "name": 63,
    "type": "loser",
    "home_team": 61,
    "away_team": 62,
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-14T17:00:00+03:00",
    "stadium": 3,
    "channels": [4, 13, 15],
    "finished": false,
    "matchday": 7,
    "stage": "Third place play-off"
  }, {
    "name": 64,
    "type": "winner",
    "home_team": 61,
    "away_team": 62,
    "home_result": null,
    "away_result": null,
    "home_penalty": null,
    "away_penalty": null,
    "winner": null,
    "date": "2018-07-15T18:00:00+03:00",
    "stadium": 1,
    "channels": [3, 4, 13, 15],
    "finished": false,
    "matchday": 7,
    "stage": "Final"
  }];
});
define("wc2018/data/sweeps/college", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = [{
    name: "Ming",
    teams: ["Belgium", "Mexico", "Egypt", "Morocco"]
  }, {
    name: "Shane",
    teams: ["Spain", "Poland", "Nigeria", "Australia"]
  }, {
    name: "Dave",
    teams: ["Portugal", "Switzerland", "Peru", "Korea Republic"]
  }, {
    name: "Dylan",
    teams: ["Argentina", "Russia", "Serbia", "Iran"]
  }, {
    name: "Will",
    teams: ["Brazil", "Denmark", "Sweden", "Panama"]
  }, {
    name: "Dan",
    teams: ["France", "Uruguay", "Senegal", "Costa Rica"]
  }, {
    name: "Niall",
    teams: ["Germany", "Croatia", "Japan", "Tunisia"]
  }, {
    name: "Eoin",
    teams: ["England", "Colombia", "Iceland", "Saudi Arabia"]
  }];
});
define("wc2018/data/sweeps/intercom", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = [{
    name: "Serena",
    teams: ["Spain", "Poland", "Sweden", "Saudi Arabia"]
  }, {
    name: "Brian",
    teams: ["Argentina", "Mexico", "Japan", "Australia"]
  }, {
    name: "Eoin",
    teams: ["Portugal", "Colombia", "Egypt", "Costa Rica"]
  }, {
    name: "Mark",
    teams: ["Belgium", "Switzerland", "Iceland", "Korea Republic"]
  }, {
    name: "Sean",
    teams: ["Germany", "Russia", "Peru", "Tunisia"]
  }, {
    name: "Marty",
    teams: ["England", "Uruguay", "Serbia", "Iran"]
  }, {
    name: "Waheed",
    teams: ["France", "Croatia", "Senegal", "Panama"]
  }, {
    name: "Austin",
    teams: ["Brazil", "Denmark", "Nigeria", "Morocco"]
  }];
});
define("wc2018/data/teams", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = [{
    "id": 23,
    "country": "Sweden",
    "alternate_name": null,
    "fifa_code": "SWE",
    "group_id": 6,
    "group_letter": "F"
  }, {
    "id": 24,
    "country": "Korea Republic",
    "alternate_name": null,
    "fifa_code": "KOR",
    "group_id": 6,
    "group_letter": "F"
  }, {
    "id": 21,
    "country": "Germany",
    "alternate_name": null,
    "fifa_code": "GER",
    "group_id": 6,
    "group_letter": "F"
  }, {
    "id": 20,
    "country": "Serbia",
    "alternate_name": null,
    "fifa_code": "SRB",
    "group_id": 5,
    "group_letter": "E"
  }, {
    "id": 17,
    "country": "Brazil",
    "alternate_name": null,
    "fifa_code": "BRA",
    "group_id": 5,
    "group_letter": "E"
  }, {
    "id": 18,
    "country": "Switzerland",
    "alternate_name": null,
    "fifa_code": "SUI",
    "group_id": 5,
    "group_letter": "E"
  }, {
    "id": 19,
    "country": "Costa Rica",
    "alternate_name": null,
    "fifa_code": "CRC",
    "group_id": 5,
    "group_letter": "E"
  }, {
    "id": 25,
    "country": "Belgium",
    "alternate_name": null,
    "fifa_code": "BEL",
    "group_id": 7,
    "group_letter": "G"
  }, {
    "id": 27,
    "country": "Tunisia",
    "alternate_name": null,
    "fifa_code": "TUN",
    "group_id": 7,
    "group_letter": "G"
  }, {
    "id": 28,
    "country": "England",
    "alternate_name": null,
    "fifa_code": "ENG",
    "group_id": 7,
    "group_letter": "G"
  }, {
    "id": 26,
    "country": "Panama",
    "alternate_name": null,
    "fifa_code": "PAN",
    "group_id": 7,
    "group_letter": "G"
  }, {
    "id": 32,
    "country": "Japan",
    "alternate_name": null,
    "fifa_code": "JPN",
    "group_id": 8,
    "group_letter": "H"
  }, {
    "id": 30,
    "country": "Senegal",
    "alternate_name": null,
    "fifa_code": "SEN",
    "group_id": 8,
    "group_letter": "H"
  }, {
    "id": 29,
    "country": "Poland",
    "alternate_name": null,
    "fifa_code": "POL",
    "group_id": 8,
    "group_letter": "H"
  }, {
    "id": 31,
    "country": "Colombia",
    "alternate_name": null,
    "fifa_code": "COL",
    "group_id": 8,
    "group_letter": "H"
  }, {
    "id": 4,
    "country": "Uruguay",
    "alternate_name": null,
    "fifa_code": "URU",
    "group_id": 1,
    "group_letter": "A"
  }, {
    "id": 1,
    "country": "Russia",
    "alternate_name": null,
    "fifa_code": "RUS",
    "group_id": 1,
    "group_letter": "A"
  }, {
    "id": 2,
    "country": "Saudi Arabia",
    "alternate_name": null,
    "fifa_code": "KSA",
    "group_id": 1,
    "group_letter": "A"
  }, {
    "id": 3,
    "country": "Egypt",
    "alternate_name": null,
    "fifa_code": "EGY",
    "group_id": 1,
    "group_letter": "A"
  }, {
    "id": 6,
    "country": "Spain",
    "alternate_name": null,
    "fifa_code": "ESP",
    "group_id": 2,
    "group_letter": "B"
  }, {
    "id": 7,
    "country": "Morocco",
    "alternate_name": null,
    "fifa_code": "MAR",
    "group_id": 2,
    "group_letter": "B"
  }, {
    "id": 8,
    "country": "Iran",
    "alternate_name": null,
    "fifa_code": "IRN",
    "group_id": 2,
    "group_letter": "B"
  }, {
    "id": 5,
    "country": "Portugal",
    "alternate_name": null,
    "fifa_code": "POR",
    "group_id": 2,
    "group_letter": "B"
  }, {
    "id": 12,
    "country": "Denmark",
    "alternate_name": null,
    "fifa_code": "DEN",
    "group_id": 3,
    "group_letter": "C"
  }, {
    "id": 9,
    "country": "France",
    "alternate_name": null,
    "fifa_code": "FRA",
    "group_id": 3,
    "group_letter": "C"
  }, {
    "id": 10,
    "country": "Australia",
    "alternate_name": null,
    "fifa_code": "AUS",
    "group_id": 3,
    "group_letter": "C"
  }, {
    "id": 11,
    "country": "Peru",
    "alternate_name": null,
    "fifa_code": "PER",
    "group_id": 3,
    "group_letter": "C"
  }, {
    "id": 14,
    "country": "Iceland",
    "alternate_name": null,
    "fifa_code": "ISL",
    "group_id": 4,
    "group_letter": "D"
  }, {
    "id": 15,
    "country": "Croatia",
    "alternate_name": null,
    "fifa_code": "CRO",
    "group_id": 4,
    "group_letter": "D"
  }, {
    "id": 16,
    "country": "Nigeria",
    "alternate_name": null,
    "fifa_code": "NGA",
    "group_id": 4,
    "group_letter": "D"
  }, {
    "id": 13,
    "country": "Argentina",
    "alternate_name": null,
    "fifa_code": "ARG",
    "group_id": 4,
    "group_letter": "D"
  }, {
    "id": 22,
    "country": "Mexico",
    "alternate_name": null,
    "fifa_code": "MEX",
    "group_id": 6,
    "group_letter": "F"
  }];
});
define('wc2018/helpers/and', ['exports', 'ember-truth-helpers/helpers/and'], function (exports, _and) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _and.default;
    }
  });
  Object.defineProperty(exports, 'and', {
    enumerable: true,
    get: function () {
      return _and.and;
    }
  });
});
define('wc2018/helpers/app-version', ['exports', 'wc2018/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  function appVersion(_, hash = {}) {
    const version = _environment.default.APP.version;
    // e.g. 1.0.0-alpha.1+4jds75hf

    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility
    let versionOnly = hash.versionOnly || hash.hideSha;
    let shaOnly = hash.shaOnly || hash.hideVersion;

    let match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      }
      // Fallback to just version
      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});
define('wc2018/helpers/append', ['exports', 'ember-composable-helpers/helpers/append'], function (exports, _append) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _append.default;
    }
  });
  Object.defineProperty(exports, 'append', {
    enumerable: true,
    get: function () {
      return _append.append;
    }
  });
});
define('wc2018/helpers/array', ['exports', 'ember-composable-helpers/helpers/array'], function (exports, _array) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _array.default;
    }
  });
  Object.defineProperty(exports, 'array', {
    enumerable: true,
    get: function () {
      return _array.array;
    }
  });
});
define('wc2018/helpers/camelize', ['exports', 'ember-cli-string-helpers/helpers/camelize'], function (exports, _camelize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _camelize.default;
    }
  });
  Object.defineProperty(exports, 'camelize', {
    enumerable: true,
    get: function () {
      return _camelize.camelize;
    }
  });
});
define('wc2018/helpers/cancel-all', ['exports', 'ember-concurrency/helpers/cancel-all'], function (exports, _cancelAll) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _cancelAll.default;
    }
  });
  Object.defineProperty(exports, 'cancelAll', {
    enumerable: true,
    get: function () {
      return _cancelAll.cancelAll;
    }
  });
});
define('wc2018/helpers/capitalize', ['exports', 'ember-cli-string-helpers/helpers/capitalize'], function (exports, _capitalize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _capitalize.default;
    }
  });
  Object.defineProperty(exports, 'capitalize', {
    enumerable: true,
    get: function () {
      return _capitalize.capitalize;
    }
  });
});
define('wc2018/helpers/chunk', ['exports', 'ember-composable-helpers/helpers/chunk'], function (exports, _chunk) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _chunk.default;
    }
  });
  Object.defineProperty(exports, 'chunk', {
    enumerable: true,
    get: function () {
      return _chunk.chunk;
    }
  });
});
define('wc2018/helpers/classify', ['exports', 'ember-cli-string-helpers/helpers/classify'], function (exports, _classify) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _classify.default;
    }
  });
  Object.defineProperty(exports, 'classify', {
    enumerable: true,
    get: function () {
      return _classify.classify;
    }
  });
});
define('wc2018/helpers/compact', ['exports', 'ember-composable-helpers/helpers/compact'], function (exports, _compact) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _compact.default;
    }
  });
  Object.defineProperty(exports, 'compact', {
    enumerable: true,
    get: function () {
      return _compact.compact;
    }
  });
});
define('wc2018/helpers/compute', ['exports', 'ember-composable-helpers/helpers/compute'], function (exports, _compute) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _compute.default;
    }
  });
  Object.defineProperty(exports, 'compute', {
    enumerable: true,
    get: function () {
      return _compute.compute;
    }
  });
});
define('wc2018/helpers/contains', ['exports', 'ember-composable-helpers/helpers/contains'], function (exports, _contains) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _contains.default;
    }
  });
  Object.defineProperty(exports, 'contains', {
    enumerable: true,
    get: function () {
      return _contains.contains;
    }
  });
});
define('wc2018/helpers/dasherize', ['exports', 'ember-cli-string-helpers/helpers/dasherize'], function (exports, _dasherize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _dasherize.default;
    }
  });
  Object.defineProperty(exports, 'dasherize', {
    enumerable: true,
    get: function () {
      return _dasherize.dasherize;
    }
  });
});
define('wc2018/helpers/dec', ['exports', 'ember-composable-helpers/helpers/dec'], function (exports, _dec) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _dec.default;
    }
  });
  Object.defineProperty(exports, 'dec', {
    enumerable: true,
    get: function () {
      return _dec.dec;
    }
  });
});
define('wc2018/helpers/drop', ['exports', 'ember-composable-helpers/helpers/drop'], function (exports, _drop) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _drop.default;
    }
  });
  Object.defineProperty(exports, 'drop', {
    enumerable: true,
    get: function () {
      return _drop.drop;
    }
  });
});
define('wc2018/helpers/eq', ['exports', 'ember-truth-helpers/helpers/equal'], function (exports, _equal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _equal.default;
    }
  });
  Object.defineProperty(exports, 'equal', {
    enumerable: true,
    get: function () {
      return _equal.equal;
    }
  });
});
define('wc2018/helpers/filter-by', ['exports', 'ember-composable-helpers/helpers/filter-by'], function (exports, _filterBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _filterBy.default;
    }
  });
  Object.defineProperty(exports, 'filterBy', {
    enumerable: true,
    get: function () {
      return _filterBy.filterBy;
    }
  });
});
define('wc2018/helpers/filter', ['exports', 'ember-composable-helpers/helpers/filter'], function (exports, _filter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _filter.default;
    }
  });
  Object.defineProperty(exports, 'filter', {
    enumerable: true,
    get: function () {
      return _filter.filter;
    }
  });
});
define('wc2018/helpers/find-by', ['exports', 'ember-composable-helpers/helpers/find-by'], function (exports, _findBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _findBy.default;
    }
  });
  Object.defineProperty(exports, 'findBy', {
    enumerable: true,
    get: function () {
      return _findBy.findBy;
    }
  });
});
define('wc2018/helpers/flatten', ['exports', 'ember-composable-helpers/helpers/flatten'], function (exports, _flatten) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _flatten.default;
    }
  });
  Object.defineProperty(exports, 'flatten', {
    enumerable: true,
    get: function () {
      return _flatten.flatten;
    }
  });
});
define('wc2018/helpers/group-by', ['exports', 'ember-composable-helpers/helpers/group-by'], function (exports, _groupBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _groupBy.default;
    }
  });
  Object.defineProperty(exports, 'groupBy', {
    enumerable: true,
    get: function () {
      return _groupBy.groupBy;
    }
  });
});
define('wc2018/helpers/gt', ['exports', 'ember-truth-helpers/helpers/gt'], function (exports, _gt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _gt.default;
    }
  });
  Object.defineProperty(exports, 'gt', {
    enumerable: true,
    get: function () {
      return _gt.gt;
    }
  });
});
define('wc2018/helpers/gte', ['exports', 'ember-truth-helpers/helpers/gte'], function (exports, _gte) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _gte.default;
    }
  });
  Object.defineProperty(exports, 'gte', {
    enumerable: true,
    get: function () {
      return _gte.gte;
    }
  });
});
define('wc2018/helpers/has-next', ['exports', 'ember-composable-helpers/helpers/has-next'], function (exports, _hasNext) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _hasNext.default;
    }
  });
  Object.defineProperty(exports, 'hasNext', {
    enumerable: true,
    get: function () {
      return _hasNext.hasNext;
    }
  });
});
define('wc2018/helpers/has-previous', ['exports', 'ember-composable-helpers/helpers/has-previous'], function (exports, _hasPrevious) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _hasPrevious.default;
    }
  });
  Object.defineProperty(exports, 'hasPrevious', {
    enumerable: true,
    get: function () {
      return _hasPrevious.hasPrevious;
    }
  });
});
define('wc2018/helpers/html-safe', ['exports', 'ember-cli-string-helpers/helpers/html-safe'], function (exports, _htmlSafe) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _htmlSafe.default;
    }
  });
  Object.defineProperty(exports, 'htmlSafe', {
    enumerable: true,
    get: function () {
      return _htmlSafe.htmlSafe;
    }
  });
});
define('wc2018/helpers/humanize', ['exports', 'ember-cli-string-helpers/helpers/humanize'], function (exports, _humanize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _humanize.default;
    }
  });
  Object.defineProperty(exports, 'humanize', {
    enumerable: true,
    get: function () {
      return _humanize.humanize;
    }
  });
});
define('wc2018/helpers/inc', ['exports', 'ember-composable-helpers/helpers/inc'], function (exports, _inc) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _inc.default;
    }
  });
  Object.defineProperty(exports, 'inc', {
    enumerable: true,
    get: function () {
      return _inc.inc;
    }
  });
});
define('wc2018/helpers/intersect', ['exports', 'ember-composable-helpers/helpers/intersect'], function (exports, _intersect) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _intersect.default;
    }
  });
  Object.defineProperty(exports, 'intersect', {
    enumerable: true,
    get: function () {
      return _intersect.intersect;
    }
  });
});
define('wc2018/helpers/invoke', ['exports', 'ember-composable-helpers/helpers/invoke'], function (exports, _invoke) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _invoke.default;
    }
  });
  Object.defineProperty(exports, 'invoke', {
    enumerable: true,
    get: function () {
      return _invoke.invoke;
    }
  });
});
define('wc2018/helpers/is-after', ['exports', 'ember-moment/helpers/is-after'], function (exports, _isAfter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isAfter.default;
    }
  });
});
define('wc2018/helpers/is-array', ['exports', 'ember-truth-helpers/helpers/is-array'], function (exports, _isArray) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isArray.default;
    }
  });
  Object.defineProperty(exports, 'isArray', {
    enumerable: true,
    get: function () {
      return _isArray.isArray;
    }
  });
});
define('wc2018/helpers/is-before', ['exports', 'ember-moment/helpers/is-before'], function (exports, _isBefore) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isBefore.default;
    }
  });
});
define('wc2018/helpers/is-between', ['exports', 'ember-moment/helpers/is-between'], function (exports, _isBetween) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isBetween.default;
    }
  });
});
define('wc2018/helpers/is-equal', ['exports', 'ember-truth-helpers/helpers/is-equal'], function (exports, _isEqual) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isEqual.default;
    }
  });
  Object.defineProperty(exports, 'isEqual', {
    enumerable: true,
    get: function () {
      return _isEqual.isEqual;
    }
  });
});
define('wc2018/helpers/is-same-or-after', ['exports', 'ember-moment/helpers/is-same-or-after'], function (exports, _isSameOrAfter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isSameOrAfter.default;
    }
  });
});
define('wc2018/helpers/is-same-or-before', ['exports', 'ember-moment/helpers/is-same-or-before'], function (exports, _isSameOrBefore) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isSameOrBefore.default;
    }
  });
});
define('wc2018/helpers/is-same', ['exports', 'ember-moment/helpers/is-same'], function (exports, _isSame) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _isSame.default;
    }
  });
});
define('wc2018/helpers/join', ['exports', 'ember-composable-helpers/helpers/join'], function (exports, _join) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _join.default;
    }
  });
  Object.defineProperty(exports, 'join', {
    enumerable: true,
    get: function () {
      return _join.join;
    }
  });
});
define('wc2018/helpers/lowercase', ['exports', 'ember-cli-string-helpers/helpers/lowercase'], function (exports, _lowercase) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _lowercase.default;
    }
  });
  Object.defineProperty(exports, 'lowercase', {
    enumerable: true,
    get: function () {
      return _lowercase.lowercase;
    }
  });
});
define('wc2018/helpers/lt', ['exports', 'ember-truth-helpers/helpers/lt'], function (exports, _lt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _lt.default;
    }
  });
  Object.defineProperty(exports, 'lt', {
    enumerable: true,
    get: function () {
      return _lt.lt;
    }
  });
});
define('wc2018/helpers/lte', ['exports', 'ember-truth-helpers/helpers/lte'], function (exports, _lte) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _lte.default;
    }
  });
  Object.defineProperty(exports, 'lte', {
    enumerable: true,
    get: function () {
      return _lte.lte;
    }
  });
});
define('wc2018/helpers/map-by', ['exports', 'ember-composable-helpers/helpers/map-by'], function (exports, _mapBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _mapBy.default;
    }
  });
  Object.defineProperty(exports, 'mapBy', {
    enumerable: true,
    get: function () {
      return _mapBy.mapBy;
    }
  });
});
define('wc2018/helpers/map', ['exports', 'ember-composable-helpers/helpers/map'], function (exports, _map) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _map.default;
    }
  });
  Object.defineProperty(exports, 'map', {
    enumerable: true,
    get: function () {
      return _map.map;
    }
  });
});
define('wc2018/helpers/moment-add', ['exports', 'ember-moment/helpers/moment-add'], function (exports, _momentAdd) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentAdd.default;
    }
  });
});
define('wc2018/helpers/moment-calendar', ['exports', 'ember-moment/helpers/moment-calendar'], function (exports, _momentCalendar) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentCalendar.default;
    }
  });
});
define('wc2018/helpers/moment-diff', ['exports', 'ember-moment/helpers/moment-diff'], function (exports, _momentDiff) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentDiff.default;
    }
  });
});
define('wc2018/helpers/moment-duration', ['exports', 'ember-moment/helpers/moment-duration'], function (exports, _momentDuration) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentDuration.default;
    }
  });
});
define('wc2018/helpers/moment-format', ['exports', 'ember-moment/helpers/moment-format'], function (exports, _momentFormat) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentFormat.default;
    }
  });
});
define('wc2018/helpers/moment-from-now', ['exports', 'ember-moment/helpers/moment-from-now'], function (exports, _momentFromNow) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentFromNow.default;
    }
  });
});
define('wc2018/helpers/moment-from', ['exports', 'ember-moment/helpers/moment-from'], function (exports, _momentFrom) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentFrom.default;
    }
  });
});
define('wc2018/helpers/moment-subtract', ['exports', 'ember-moment/helpers/moment-subtract'], function (exports, _momentSubtract) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentSubtract.default;
    }
  });
});
define('wc2018/helpers/moment-to-date', ['exports', 'ember-moment/helpers/moment-to-date'], function (exports, _momentToDate) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentToDate.default;
    }
  });
});
define('wc2018/helpers/moment-to-now', ['exports', 'ember-moment/helpers/moment-to-now'], function (exports, _momentToNow) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentToNow.default;
    }
  });
});
define('wc2018/helpers/moment-to', ['exports', 'ember-moment/helpers/moment-to'], function (exports, _momentTo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _momentTo.default;
    }
  });
});
define('wc2018/helpers/moment-unix', ['exports', 'ember-moment/helpers/unix'], function (exports, _unix) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _unix.default;
    }
  });
});
define('wc2018/helpers/moment', ['exports', 'ember-moment/helpers/moment'], function (exports, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _moment.default;
    }
  });
});
define('wc2018/helpers/next', ['exports', 'ember-composable-helpers/helpers/next'], function (exports, _next) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _next.default;
    }
  });
  Object.defineProperty(exports, 'next', {
    enumerable: true,
    get: function () {
      return _next.next;
    }
  });
});
define('wc2018/helpers/not-eq', ['exports', 'ember-truth-helpers/helpers/not-equal'], function (exports, _notEqual) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _notEqual.default;
    }
  });
  Object.defineProperty(exports, 'notEq', {
    enumerable: true,
    get: function () {
      return _notEqual.notEq;
    }
  });
});
define('wc2018/helpers/not', ['exports', 'ember-truth-helpers/helpers/not'], function (exports, _not) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _not.default;
    }
  });
  Object.defineProperty(exports, 'not', {
    enumerable: true,
    get: function () {
      return _not.not;
    }
  });
});
define('wc2018/helpers/now', ['exports', 'ember-moment/helpers/now'], function (exports, _now) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _now.default;
    }
  });
});
define('wc2018/helpers/object-at', ['exports', 'ember-composable-helpers/helpers/object-at'], function (exports, _objectAt) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _objectAt.default;
    }
  });
  Object.defineProperty(exports, 'objectAt', {
    enumerable: true,
    get: function () {
      return _objectAt.objectAt;
    }
  });
});
define('wc2018/helpers/optional', ['exports', 'ember-composable-helpers/helpers/optional'], function (exports, _optional) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _optional.default;
    }
  });
  Object.defineProperty(exports, 'optional', {
    enumerable: true,
    get: function () {
      return _optional.optional;
    }
  });
});
define('wc2018/helpers/or', ['exports', 'ember-truth-helpers/helpers/or'], function (exports, _or) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _or.default;
    }
  });
  Object.defineProperty(exports, 'or', {
    enumerable: true,
    get: function () {
      return _or.or;
    }
  });
});
define('wc2018/helpers/perform', ['exports', 'ember-concurrency/helpers/perform'], function (exports, _perform) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _perform.default;
    }
  });
  Object.defineProperty(exports, 'perform', {
    enumerable: true,
    get: function () {
      return _perform.perform;
    }
  });
});
define('wc2018/helpers/pipe-action', ['exports', 'ember-composable-helpers/helpers/pipe-action'], function (exports, _pipeAction) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _pipeAction.default;
    }
  });
});
define('wc2018/helpers/pipe', ['exports', 'ember-composable-helpers/helpers/pipe'], function (exports, _pipe) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _pipe.default;
    }
  });
  Object.defineProperty(exports, 'pipe', {
    enumerable: true,
    get: function () {
      return _pipe.pipe;
    }
  });
});
define('wc2018/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
define('wc2018/helpers/previous', ['exports', 'ember-composable-helpers/helpers/previous'], function (exports, _previous) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _previous.default;
    }
  });
  Object.defineProperty(exports, 'previous', {
    enumerable: true,
    get: function () {
      return _previous.previous;
    }
  });
});
define('wc2018/helpers/queue', ['exports', 'ember-composable-helpers/helpers/queue'], function (exports, _queue) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _queue.default;
    }
  });
  Object.defineProperty(exports, 'queue', {
    enumerable: true,
    get: function () {
      return _queue.queue;
    }
  });
});
define('wc2018/helpers/range', ['exports', 'ember-composable-helpers/helpers/range'], function (exports, _range) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _range.default;
    }
  });
  Object.defineProperty(exports, 'range', {
    enumerable: true,
    get: function () {
      return _range.range;
    }
  });
});
define('wc2018/helpers/reduce', ['exports', 'ember-composable-helpers/helpers/reduce'], function (exports, _reduce) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _reduce.default;
    }
  });
  Object.defineProperty(exports, 'reduce', {
    enumerable: true,
    get: function () {
      return _reduce.reduce;
    }
  });
});
define('wc2018/helpers/reject-by', ['exports', 'ember-composable-helpers/helpers/reject-by'], function (exports, _rejectBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _rejectBy.default;
    }
  });
  Object.defineProperty(exports, 'rejectBy', {
    enumerable: true,
    get: function () {
      return _rejectBy.rejectBy;
    }
  });
});
define('wc2018/helpers/repeat', ['exports', 'ember-composable-helpers/helpers/repeat'], function (exports, _repeat) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _repeat.default;
    }
  });
  Object.defineProperty(exports, 'repeat', {
    enumerable: true,
    get: function () {
      return _repeat.repeat;
    }
  });
});
define('wc2018/helpers/reverse', ['exports', 'ember-composable-helpers/helpers/reverse'], function (exports, _reverse) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _reverse.default;
    }
  });
  Object.defineProperty(exports, 'reverse', {
    enumerable: true,
    get: function () {
      return _reverse.reverse;
    }
  });
});
define('wc2018/helpers/shuffle', ['exports', 'ember-composable-helpers/helpers/shuffle'], function (exports, _shuffle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _shuffle.default;
    }
  });
  Object.defineProperty(exports, 'shuffle', {
    enumerable: true,
    get: function () {
      return _shuffle.shuffle;
    }
  });
});
define('wc2018/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
define('wc2018/helpers/slice', ['exports', 'ember-composable-helpers/helpers/slice'], function (exports, _slice) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _slice.default;
    }
  });
  Object.defineProperty(exports, 'slice', {
    enumerable: true,
    get: function () {
      return _slice.slice;
    }
  });
});
define('wc2018/helpers/sort-by', ['exports', 'ember-composable-helpers/helpers/sort-by'], function (exports, _sortBy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _sortBy.default;
    }
  });
  Object.defineProperty(exports, 'sortBy', {
    enumerable: true,
    get: function () {
      return _sortBy.sortBy;
    }
  });
});
define('wc2018/helpers/take', ['exports', 'ember-composable-helpers/helpers/take'], function (exports, _take) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _take.default;
    }
  });
  Object.defineProperty(exports, 'take', {
    enumerable: true,
    get: function () {
      return _take.take;
    }
  });
});
define('wc2018/helpers/task', ['exports', 'ember-concurrency/helpers/task'], function (exports, _task) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _task.default;
    }
  });
  Object.defineProperty(exports, 'task', {
    enumerable: true,
    get: function () {
      return _task.task;
    }
  });
});
define('wc2018/helpers/titleize', ['exports', 'ember-cli-string-helpers/helpers/titleize'], function (exports, _titleize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _titleize.default;
    }
  });
  Object.defineProperty(exports, 'titleize', {
    enumerable: true,
    get: function () {
      return _titleize.titleize;
    }
  });
});
define('wc2018/helpers/toggle-action', ['exports', 'ember-composable-helpers/helpers/toggle-action'], function (exports, _toggleAction) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _toggleAction.default;
    }
  });
});
define('wc2018/helpers/toggle', ['exports', 'ember-composable-helpers/helpers/toggle'], function (exports, _toggle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _toggle.default;
    }
  });
  Object.defineProperty(exports, 'toggle', {
    enumerable: true,
    get: function () {
      return _toggle.toggle;
    }
  });
});
define('wc2018/helpers/trim', ['exports', 'ember-cli-string-helpers/helpers/trim'], function (exports, _trim) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _trim.default;
    }
  });
  Object.defineProperty(exports, 'trim', {
    enumerable: true,
    get: function () {
      return _trim.trim;
    }
  });
});
define('wc2018/helpers/truncate', ['exports', 'ember-cli-string-helpers/helpers/truncate'], function (exports, _truncate) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _truncate.default;
    }
  });
  Object.defineProperty(exports, 'truncate', {
    enumerable: true,
    get: function () {
      return _truncate.truncate;
    }
  });
});
define('wc2018/helpers/underscore', ['exports', 'ember-cli-string-helpers/helpers/underscore'], function (exports, _underscore) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _underscore.default;
    }
  });
  Object.defineProperty(exports, 'underscore', {
    enumerable: true,
    get: function () {
      return _underscore.underscore;
    }
  });
});
define('wc2018/helpers/union', ['exports', 'ember-composable-helpers/helpers/union'], function (exports, _union) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _union.default;
    }
  });
  Object.defineProperty(exports, 'union', {
    enumerable: true,
    get: function () {
      return _union.union;
    }
  });
});
define('wc2018/helpers/unix', ['exports', 'ember-moment/helpers/unix'], function (exports, _unix) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _unix.default;
    }
  });
});
define('wc2018/helpers/uppercase', ['exports', 'ember-cli-string-helpers/helpers/uppercase'], function (exports, _uppercase) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _uppercase.default;
    }
  });
  Object.defineProperty(exports, 'uppercase', {
    enumerable: true,
    get: function () {
      return _uppercase.uppercase;
    }
  });
});
define('wc2018/helpers/utc', ['exports', 'ember-moment/helpers/utc'], function (exports, _utc) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _utc.default;
    }
  });
  Object.defineProperty(exports, 'utc', {
    enumerable: true,
    get: function () {
      return _utc.utc;
    }
  });
});
define('wc2018/helpers/w', ['exports', 'ember-cli-string-helpers/helpers/w'], function (exports, _w) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _w.default;
    }
  });
  Object.defineProperty(exports, 'w', {
    enumerable: true,
    get: function () {
      return _w.w;
    }
  });
});
define('wc2018/helpers/without', ['exports', 'ember-composable-helpers/helpers/without'], function (exports, _without) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _without.default;
    }
  });
  Object.defineProperty(exports, 'without', {
    enumerable: true,
    get: function () {
      return _without.without;
    }
  });
});
define('wc2018/helpers/xor', ['exports', 'ember-truth-helpers/helpers/xor'], function (exports, _xor) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _xor.default;
    }
  });
  Object.defineProperty(exports, 'xor', {
    enumerable: true,
    get: function () {
      return _xor.xor;
    }
  });
});
define('wc2018/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'wc2018/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  let name, version;
  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
define('wc2018/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize() {
      let app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('wc2018/initializers/ember-concurrency', ['exports', 'ember-concurrency/initializers/ember-concurrency'], function (exports, _emberConcurrency) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _emberConcurrency.default;
    }
  });
  Object.defineProperty(exports, 'initialize', {
    enumerable: true,
    get: function () {
      return _emberConcurrency.initialize;
    }
  });
});
define('wc2018/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
define('wc2018/initializers/export-application-global', ['exports', 'wc2018/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function () {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define("wc2018/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
define('wc2018/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
define('wc2018/router', ['exports', 'wc2018/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });

  Router.map(function () {
    this.route('sweepstake', { path: ':id' });
  });

  exports.default = Router;
});
define('wc2018/routes/sweepstake', ['exports', 'wc2018/data/sweeps/intercom', 'wc2018/data/sweeps/college'], function (exports, _intercom, _college) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({
    matchService: Ember.inject.service(),

    model(path) {
      if (path.id === 'intercom') {
        return _intercom.default;
      } else {
        return _college.default;
      }
    },

    afterModel(model) {
      this.get('matchService').start(model);
    }
  });
});
define('wc2018/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
define('wc2018/services/match-service', ['exports', 'ember-concurrency', 'wc2018/data/teams'], function (exports, _emberConcurrency, _teams) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Service.extend({
    ajax: Ember.inject.service(),
    apiURL: 'https://world-cup-json.herokuapp.com/matches',

    initialFetchRunning: Ember.computed.alias('initialMatchFetch.isRunning'),
    isRunning: Ember.computed.alias('fetchMatches.isRunning'),

    init() {
      this._super(...arguments);
      this.set('matches', []);
    },

    futureMatches: Ember.computed('matches.[]', function () {
      return this.get('matches').filter(match => match.status === 'future');
    }),

    liveMatches: Ember.computed('matches.[]', function () {
      return this.get('matches').filter(match => match.status === 'in progress');
    }),

    start(players) {
      this.set('players', players);
      this.get('fetchMatches').perform();
      this.get('initialMatchFetch').perform();
      this.set('clockTime', 30);
    },

    initialMatchFetch: (0, _emberConcurrency.task)(function* () {
      yield this.get('fetchMatches').perform();
      this.get('pollResults').perform();
    }),

    teamToPlayerSet: Ember.computed('players.[]', function () {
      let teamToPlayerSet = {};
      this.get('players').forEach(player => {
        player.teams.map(team => teamToPlayerSet[team] = player);
      });
      return teamToPlayerSet;
    }),

    fetchMatches: (0, _emberConcurrency.task)(function* () {
      let data = yield this.get('fetchTask').perform();
      let matches = this.injectGameStages(data).sortBy('datetime');
      matches = this.injectPlayerName(matches);
      this.set('matches', matches);
    }),

    pollResults: (0, _emberConcurrency.task)(function* () {
      while (this.get('clockTime') > 0) {
        yield (0, _emberConcurrency.timeout)(1000);
        this.decrementProperty('clockTime');
      }
      yield this.get('fetchMatches').perform();
      this.set('clockTime', 30);
      this.get('pollResults').perform();
    }),

    fetchTask: (0, _emberConcurrency.task)(function* () {
      if (this.get('runningTask')) {
        return yield this.get('runningTask');
      } else {
        let task = this.get('doFetch').perform();
        this.set('runningTask', task);
        return yield task;
      }
    }),

    doFetch: (0, _emberConcurrency.task)(function* () {
      let result = yield this.get('ajax').request(this.get('apiURL'));
      this.set('runningTask', null);
      return result;
    }),

    filterMatches(status) {
      return this.get('matches').filter(match => match.status === status);
    },

    injectGameStages(matchArray) {
      return matchArray.map(match => {
        if (match.stage_name == 'First stage') {
          match.stage = `Group ${_teams.default.findBy('country', match.home_team_country).group_letter}`;
        } else {
          match.stage = match.stage_name;
        }
        return match;
      });
    },

    injectPlayerName(matchArray) {
      return matchArray.map(match => {
        if (match.home_team.team_tbd) {
          let teamIndex = Number.parseInt(match.home_team.team_tbd.replace('W', '')) - 1;
          if (matchArray[teamIndex]) {
            let oldMatch = matchArray[teamIndex] || {};
            let team = oldMatch.winner || "To be determined";
            match.home_team_country = team;
            match.home_team.country = team;
            match.home_team.code = oldMatch.winner_code || "TBD";
            console.log(`Injected ${team} as participant for ${match.stage_name} from ${oldMatch.home_team_country} v ${oldMatch.away_team_country}`);
          }
        }
        if (match.away_team.team_tbd) {
          let teamIndex = Number.parseInt(match.away_team.team_tbd.replace('W', '')) - 1;
          if (matchArray[teamIndex]) {
            let oldMatch = matchArray[teamIndex] || {};
            let team = oldMatch.winner || "To be determined";
            match.away_team_country = team;
            match.away_team.country = team;
            match.away_team.code = oldMatch.winner_code || "TBD";
            console.log(`Injected ${team} as participant for ${match.stage_name} from ${oldMatch.home_team_country} v ${oldMatch.away_team_country}`);
          }
        }
        match.home_team.player_name = this.playerNameForCountry(match.home_team_country);
        match.away_team.player_name = this.playerNameForCountry(match.away_team_country);
        return match;
      });
    },

    playerNameForCountry(country) {
      let player = this.get('teamToPlayerSet')[country];
      return player ? player.name : '';
    }

  });
});
define('wc2018/services/moment', ['exports', 'ember-moment/services/moment', 'wc2018/config/environment'], function (exports, _moment, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const { get } = Ember;

  exports.default = _moment.default.extend({
    defaultFormat: get(_environment.default, 'moment.outputFormat')
  });
});
define("wc2018/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "Ec61Hlrl", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1 o__has-rows o__scrolls\"],[7],[0,\"\\n  \"],[6,\"header\"],[9,\"class\",\"layout__box\"],[7],[0,\"\\n\"],[0,\"  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1 o__has-rows o__centers-horizontally u__pad__20\"],[7],[0,\"\\n    \"],[1,[18,\"outlet\"],false],[0,\"\\n  \"],[8],[0,\"\\n\"],[8]],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/application.hbs" } });
});
define("wc2018/templates/components/live-match", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "O0CTRv4Z", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"card-header o__blue layout__box o__has-columns o__centers-vertically\"],[7],[0,\"\\n  \"],[6,\"div\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"ring-container\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"ringring\"],[7],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"circle\"],[7],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"u__ml__60 live-match-title layout__box o__flexes-to-1\"],[7],[0,\"\\n    \"],[6,\"b\"],[7],[1,[25,\"uppercase\",[[20,[\"match\",\"stage\"]]],null],false],[0,\" LIVE\"],[8],[0,\" (\"],[1,[20,[\"match\",\"time\"]],false],[0,\")\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"clock-tick\"],[7],[0,\"\\n\"],[4,\"if\",[[20,[\"matchService\",\"isRunning\"]]],null,{\"statements\":[[0,\"      Updating...\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      Updating in: \"],[1,[20,[\"matchService\",\"clockTime\"]],false],[0,\"\\n\"]],\"parameters\":[]}],[0,\"  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1 live-match-container\"],[7],[0,\"\\n  \"],[6,\"table\"],[9,\"class\",\"u__width__100\"],[7],[0,\"\\n    \"],[6,\"tbody\"],[7],[0,\"\\n      \"],[6,\"tr\"],[7],[0,\"\\n        \"],[6,\"td\"],[9,\"class\",\"flag-sizer\"],[7],[0,\"\\n          \"],[6,\"img\"],[9,\"class\",\"fixture-flag\"],[10,\"src\",[26,[\"https://raw.githubusercontent.com/nolaneo/wc2018/master/public/assets/images/flags/\",[25,\"dasherize\",[[25,\"lowercase\",[[20,[\"match\",\"home_team\",\"country\"]]],null]],null],\".png\"]]],[7],[8],[0,\"\\n        \"],[8],[0,\"\\n        \"],[6,\"td\"],[9,\"rowspan\",\"3\"],[7],[0,\"\\n\"],[0,\"        \"],[8],[0,\"\\n        \"],[6,\"td\"],[9,\"class\",\"score\"],[9,\"rowspan\",\"3\"],[7],[0,\"\\n          \"],[1,[20,[\"match\",\"home_team\",\"goals\"]],false],[0,\"\\n        \"],[8],[0,\"\\n        \"],[6,\"td\"],[9,\"class\",\"score-divider\"],[9,\"rowspan\",\"3\"],[7],[0,\"\\n          –\\n        \"],[8],[0,\"\\n        \"],[6,\"td\"],[9,\"class\",\"score\"],[9,\"rowspan\",\"3\"],[7],[0,\"\\n          \"],[1,[20,[\"match\",\"away_team\",\"goals\"]],false],[0,\"\\n        \"],[8],[0,\"\\n        \"],[6,\"td\"],[9,\"rowspan\",\"3\"],[7],[0,\"\\n\"],[0,\"        \"],[8],[0,\"\\n        \"],[6,\"td\"],[9,\"class\",\"flag-sizer\"],[7],[0,\"\\n          \"],[6,\"img\"],[9,\"class\",\"fixture-flag\"],[10,\"src\",[26,[\"https://raw.githubusercontent.com/nolaneo/wc2018/master/public/assets/images/flags/\",[25,\"dasherize\",[[25,\"lowercase\",[[20,[\"match\",\"away_team\",\"country\"]]],null]],null],\".png\"]]],[7],[8],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"tr\"],[7],[0,\"\\n        \"],[6,\"td\"],[9,\"class\",\"live-team-name\"],[7],[0,\"\\n          \"],[1,[25,\"uppercase\",[[20,[\"match\",\"home_team\",\"country\"]]],null],false],[0,\"\\n        \"],[8],[0,\"\\n        \"],[6,\"td\"],[9,\"class\",\"live-team-name\"],[7],[0,\"\\n          \"],[1,[25,\"uppercase\",[[20,[\"match\",\"away_team\",\"country\"]]],null],false],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n      \"],[6,\"tr\"],[7],[0,\"\\n        \"],[6,\"td\"],[9,\"class\",\"live-player-name\"],[7],[0,\"\\n          \"],[1,[20,[\"match\",\"home_team\",\"player_name\"]],false],[0,\"\\n        \"],[8],[0,\"\\n        \"],[6,\"td\"],[9,\"class\",\"live-player-name\"],[7],[0,\"\\n          \"],[1,[20,[\"match\",\"away_team\",\"player_name\"]],false],[0,\"\\n        \"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[1,[25,\"match-stats\",null,[[\"match\"],[[20,[\"match\"]]]]],false],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/components/live-match.hbs" } });
});
define("wc2018/templates/components/live-matches", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "xx54B+Qs", "block": "{\"symbols\":[\"match\"],\"statements\":[[6,\"div\"],[9,\"class\",\"layout__box o__has-rows u__mb__20\"],[7],[0,\"\\n\"],[4,\"each\",[[20,[\"matchService\",\"liveMatches\"]]],null,{\"statements\":[[0,\"    \"],[1,[25,\"live-match\",null,[[\"match\",\"matchService\"],[[19,1,[]],[20,[\"matchService\"]]]]],false],[0,\"\\n\"]],\"parameters\":[1]},null],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/components/live-matches.hbs" } });
});
define("wc2018/templates/components/match-component", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "8q3CFt1f", "block": "{\"symbols\":[],\"statements\":[],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/components/match-component.hbs" } });
});
define("wc2018/templates/components/match-list", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "b4744yW3", "block": "{\"symbols\":[\"match\"],\"statements\":[[6,\"h3\"],[9,\"class\",\"u__mb__20\"],[7],[0,\"\\n  Upcoming matches\\n  \"],[4,\"if\",[[20,[\"filterPlayer\"]]],null,{\"statements\":[[0,\" \"],[6,\"b\"],[7],[0,\"for \"],[1,[18,\"filterPlayer\"],false],[8]],\"parameters\":[]},null],[0,\"\\n  \"],[4,\"if\",[[20,[\"matchesFilteredByPlayer\",\"length\"]]],null,{\"statements\":[[0,\"(\"],[1,[20,[\"matchesFilteredByPlayer\",\"length\"]],false],[0,\")\"]],\"parameters\":[]},null],[0,\"\\n\"],[8],[0,\"\\n\\n\"],[6,\"div\"],[9,\"class\",\"layout__box o__has-rows u__mb__20\"],[7],[0,\"\\n\"],[4,\"each\",[[20,[\"matchesFilteredByPlayer\"]]],null,{\"statements\":[[0,\"    \"],[1,[25,\"upcoming-match\",null,[[\"match\",\"matches\"],[[19,1,[]],[20,[\"matches\"]]]]],false],[0,\"\\n\"]],\"parameters\":[1]},null],[8],[0,\"\\n\\n\"],[4,\"if\",[[20,[\"matchService\",\"initialFetchRunning\"]]],null,{\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1 o__centers-horizontally\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"t__centered\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"loader\"],[7],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"t__small-caps u__mt__10\"],[7],[0,\"Loading fixtures\"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/components/match-list.hbs" } });
});
define("wc2018/templates/components/match-stats", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "VaVWTfA3", "block": "{\"symbols\":[\"event\"],\"statements\":[[4,\"each\",[[20,[\"events\"]]],null,{\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"layout__box o__has-columns o__centers-vertically stat-row small-stat-text\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"layout__box t__left stat-event o__has-columns\"],[7],[0,\"\\n\"],[4,\"if\",[[25,\"eq\",[[19,1,[\"side\"]],\"home\"],null]],null,{\"statements\":[[0,\"        \"],[6,\"div\"],[7],[0,\"\\n          \"],[6,\"b\"],[9,\"class\",\"u__mr__15\"],[7],[1,[19,1,[\"time\"]],false],[8],[0,\" \"],[6,\"span\"],[9,\"class\",\"t__light\"],[7],[1,[19,1,[\"player\"]],false],[8],[0,\"\\n        \"],[8],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1 stat-spacer u__ml__15\"],[7],[8],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"layout__box t__centered o__flexes-to-1 stat-time\"],[7],[0,\"\\n      \"],[6,\"img\"],[9,\"class\",\"stat-image\"],[10,\"src\",[26,[\"https://raw.githubusercontent.com/nolaneo/wc2018/master/public/assets/images/events/\",[19,1,[\"type_of_event\"]],\".png\"]]],[7],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"layout__box t__right stat-event o__has-columns\"],[7],[0,\"\\n\"],[4,\"if\",[[25,\"eq\",[[19,1,[\"side\"]],\"away\"],null]],null,{\"statements\":[[0,\"        \"],[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1 stat-spacer u__mr__15\"],[7],[8],[0,\"\\n        \"],[6,\"div\"],[7],[0,\"\\n          \"],[6,\"span\"],[9,\"class\",\"t__light u__mr__15\"],[7],[1,[19,1,[\"player\"]],false],[8],[0,\" \"],[6,\"b\"],[7],[1,[19,1,[\"time\"]],false],[8],[0,\"\\n        \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"parameters\":[1]},null]],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/components/match-stats.hbs" } });
});
define("wc2018/templates/components/past-match", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "sPxvn3oj", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1 live-match-container o__has-columns o__centers-vertically\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"past-score o__left\"],[7],[0,\"\\n    \"],[1,[20,[\"match\",\"home_team\",\"goals\"]],false],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[7],[0,\"\\n    \"],[6,\"img\"],[9,\"class\",\"upcoming-match-flag\"],[10,\"src\",[26,[\"https://raw.githubusercontent.com/nolaneo/wc2018/master/public/assets/images/flags/\",[25,\"dasherize\",[[25,\"lowercase\",[[20,[\"match\",\"home_team\",\"country\"]]],null]],null],\".png\"]]],[7],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"upcoming-country-name layout__box o__flexes-to-5 t__centered\"],[7],[0,\"\\n    \"],[6,\"b\"],[7],[1,[25,\"uppercase\",[[20,[\"match\",\"home_team\",\"country\"]]],null],false],[8],[0,\" – \"],[1,[25,\"uppercase\",[[20,[\"match\",\"home_team\",\"player_name\"]]],null],false],[0,\"\\n  \"],[8],[0,\"\\n\\n  \"],[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-5\"],[7],[0,\"\\n  \"],[8],[0,\"\\n\\n  \"],[6,\"div\"],[9,\"class\",\"upcoming-country-name layout__box o__flexes-to-5 t__centered\"],[7],[0,\"\\n    \"],[1,[25,\"uppercase\",[[20,[\"match\",\"away_team\",\"player_name\"]]],null],false],[0,\" – \"],[6,\"b\"],[7],[1,[25,\"uppercase\",[[20,[\"match\",\"away_team\",\"country\"]]],null],false],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[7],[0,\"\\n    \"],[6,\"img\"],[9,\"class\",\"upcoming-match-flag\"],[10,\"src\",[26,[\"https://raw.githubusercontent.com/nolaneo/wc2018/master/public/assets/images/flags/\",[25,\"dasherize\",[[25,\"lowercase\",[[20,[\"match\",\"away_team\",\"country\"]]],null]],null],\".png\"]]],[7],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"past-score o__right\"],[7],[0,\"\\n    \"],[1,[20,[\"match\",\"away_team\",\"goals\"]],false],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/components/past-match.hbs" } });
});
define("wc2018/templates/components/past-matches", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "OlVAfSn3", "block": "{\"symbols\":[\"match\"],\"statements\":[[6,\"h3\"],[9,\"class\",\"past-match-toggle u__mb__20 layout__box o__flexes-to-1 u__hover o__has-rows o__centers-vertically\"],[3,\"action\",[[19,0,[]],\"toggle\"]],[7],[0,\"\\n  \"],[6,\"h3\"],[9,\"class\",\"layout__box o__flexes-to-1\"],[7],[0,\"\\n    Completed matches\\n    \"],[4,\"if\",[[20,[\"filterPlayer\"]]],null,{\"statements\":[[0,\" \"],[6,\"b\"],[7],[0,\"for \"],[1,[18,\"filterPlayer\"],false],[8]],\"parameters\":[]},null],[0,\"\\n    \"],[4,\"if\",[[20,[\"matchesFilteredByPlayer\",\"length\"]]],null,{\"statements\":[[0,\"(\"],[1,[20,[\"matchesFilteredByPlayer\",\"length\"]],false],[0,\")\"]],\"parameters\":[]},null],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[10,\"class\",[26,[[25,\"if\",[[20,[\"isOpen\"]],\"chevron top\",\"chevron bottom\"],null]]]],[9,\"style\",\"opacity: 0.3; margin-right: 20px; margin-top: 5px;\"],[7],[8],[0,\"\\n\"],[8],[0,\"\\n\\n\"],[4,\"if\",[[20,[\"isOpen\"]]],null,{\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"layout__box o__has-rows u__mb__20\"],[7],[0,\"\\n\"],[4,\"each\",[[20,[\"matchesFilteredByPlayer\"]]],null,{\"statements\":[[0,\"      \"],[1,[25,\"past-match\",null,[[\"match\"],[[19,1,[]]]]],false],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"  \"],[8],[0,\"\\n\\n\"],[4,\"if\",[[20,[\"matchService\",\"initialFetchRunning\"]]],null,{\"statements\":[[0,\"    \"],[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1 o__centers-horizontally\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"t__centered\"],[7],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"loader\"],[7],[8],[0,\"\\n        \"],[6,\"div\"],[9,\"class\",\"t__small-caps u__mt__10\"],[7],[0,\"Loading fixture\"],[8],[0,\"\\n      \"],[8],[0,\"\\n    \"],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null]],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/components/past-matches.hbs" } });
});
define("wc2018/templates/components/pool-table-row", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "ryG19QzP", "block": "{\"symbols\":[\"team\"],\"statements\":[[6,\"td\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"u__width__100\"],[7],[2,\"SPACER\"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"layout__box o__has-columns\"],[7],[0,\"\\n\"],[4,\"each\",[[20,[\"player\",\"teams\"]]],null,{\"statements\":[[0,\"      \"],[6,\"img\"],[10,\"class\",[26,[\"pool-table-flag \",[25,\"unless\",[[25,\"contains\",[[19,1,[]],[20,[\"upcomingTeams\"]]],null],\"o__out\"],null]]]],[10,\"src\",[26,[\"https://raw.githubusercontent.com/nolaneo/wc2018/master/public/assets/images/flags/\",[25,\"dasherize\",[[19,1,[]]],null],\".png\"]]],[7],[8],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"td\"],[7],[0,\"\\n  \"],[6,\"b\"],[7],[1,[20,[\"player\",\"name\"]],false],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"td\"],[9,\"class\",\"live-col no-width\"],[7],[0,\"\\n\"],[4,\"if\",[[20,[\"player\",\"currentlyPlaying\"]]],null,{\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"ring-container\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"ringring\"],[7],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"circle\"],[7],[8],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[8],[0,\"\\n\"],[6,\"td\"],[7],[0,\"\\n  \"],[1,[20,[\"player\",\"games_played\"]],false],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"td\"],[9,\"class\",\"small-col\"],[7],[0,\"\\n  \"],[1,[20,[\"player\",\"wins\"]],false],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"td\"],[9,\"class\",\"small-col\"],[7],[0,\"\\n  \"],[1,[20,[\"player\",\"draws\"]],false],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"td\"],[9,\"class\",\"small-col\"],[7],[0,\"\\n  \"],[1,[20,[\"player\",\"losses\"]],false],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"td\"],[9,\"class\",\"hide-small\"],[7],[0,\"\\n  \"],[1,[20,[\"player\",\"goals_for\"]],false],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"td\"],[9,\"class\",\"hide-small\"],[7],[0,\"\\n  \"],[1,[20,[\"player\",\"goals_against\"]],false],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"td\"],[7],[0,\"\\n  \"],[1,[20,[\"player\",\"goal_differential\"]],false],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"td\"],[7],[0,\"\\n  \"],[1,[20,[\"player\",\"points\"]],false],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/components/pool-table-row.hbs" } });
});
define("wc2018/templates/components/pool-table", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "VNEMgdPw", "block": "{\"symbols\":[\"player\"],\"statements\":[[6,\"table\"],[9,\"class\",\"pool-stage-table\"],[7],[0,\"\\n  \"],[6,\"thead\"],[7],[0,\"\\n    \"],[6,\"th\"],[7],[0,\"POOL TABLE\"],[8],[0,\"\\n    \"],[6,\"th\"],[9,\"class\",\"u__width__100\"],[7],[0,\"PLAYER\"],[8],[0,\"\\n    \"],[6,\"th\"],[9,\"class\",\"no-width\"],[7],[8],[0,\"\\n    \"],[6,\"th\"],[7],[0,\"PL\"],[8],[0,\"\\n    \"],[6,\"th\"],[9,\"class\",\"small-col\"],[7],[0,\"W\"],[8],[0,\"\\n    \"],[6,\"th\"],[9,\"class\",\"small-col\"],[7],[0,\"D\"],[8],[0,\"\\n    \"],[6,\"th\"],[9,\"class\",\"small-col\"],[7],[0,\"L\"],[8],[0,\"\\n    \"],[6,\"th\"],[9,\"class\",\"hide-small\"],[7],[0,\"GF\"],[8],[0,\"\\n    \"],[6,\"th\"],[9,\"class\",\"hide-small\"],[7],[0,\"GA\"],[8],[0,\"\\n    \"],[6,\"th\"],[7],[0,\"GD\"],[8],[0,\"\\n    \"],[6,\"th\"],[7],[0,\"PTS\"],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"tbody\"],[7],[0,\"\\n\"],[4,\"each\",[[20,[\"poolPlayers\"]]],null,{\"statements\":[[0,\"      \"],[1,[25,\"pool-table-row\",null,[[\"player\",\"filterPlayer\",\"toggleFilter\",\"upcomingTeams\"],[[19,1,[]],[20,[\"filterPlayer\"]],[20,[\"toggleFilter\"]],[20,[\"upcomingTeams\"]]]]],false],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\\n\"],[4,\"if\",[[20,[\"fetchPoolResults\",\"isRunning\"]]],null,{\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1 o__centers-horizontally\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"t__centered\"],[7],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"loader\"],[7],[8],[0,\"\\n      \"],[6,\"div\"],[9,\"class\",\"t__small-caps u__mt__10\"],[7],[0,\"Loading Results\"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/components/pool-table.hbs" } });
});
define("wc2018/templates/components/upcoming-match", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "kT7BuYLR", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"card-header o__white layout__box o__has-columns o__centers-vertically\"],[7],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1\"],[7],[0,\"\\n    \"],[1,[25,\"uppercase\",[[25,\"moment-from-now\",[[20,[\"match\",\"datetime\"]]],null]],null],false],[0,\" \"],[6,\"span\"],[9,\"class\",\"u__ml__20 t__light\"],[7],[1,[25,\"moment-format\",[[25,\"moment\",[[20,[\"match\",\"datetime\"]]],null],\"MMM DD - HH:SS\"],null],false],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[7],[0,\"\\n    \"],[1,[20,[\"match\",\"stage\"]],false],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"],[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1 live-match-container o__has-columns o__centers-vertically\"],[7],[0,\"\\n  \"],[6,\"div\"],[7],[0,\"\\n    \"],[6,\"img\"],[9,\"class\",\"upcoming-match-flag\"],[10,\"src\",[26,[\"https://raw.githubusercontent.com/nolaneo/wc2018/master/public/assets/images/flags/\",[25,\"dasherize\",[[25,\"lowercase\",[[20,[\"match\",\"home_team\",\"country\"]]],null]],null],\".png\"]]],[7],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"div\"],[9,\"class\",\"upcoming-country-name layout__box o__flexes-to-5 t__centered\"],[7],[0,\"\\n\"],[4,\"if\",[[25,\"eq\",[[20,[\"match\",\"home_team\",\"code\"]],\"TBD\"],null]],null,{\"statements\":[[0,\"      \"],[6,\"b\"],[7],[0,\"TBD\"],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[6,\"b\"],[7],[1,[25,\"uppercase\",[[20,[\"match\",\"home_team\",\"country\"]]],null],false],[8],[0,\" – \"],[1,[25,\"uppercase\",[[20,[\"match\",\"home_team\",\"player_name\"]]],null],false],[0,\"\\n\"]],\"parameters\":[]}],[0,\"  \"],[8],[0,\"\\n\\n  \"],[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-5\"],[7],[8],[0,\"\\n\\n  \"],[6,\"div\"],[9,\"class\",\"upcoming-country-name layout__box o__flexes-to-5 t__centered\"],[7],[0,\"\\n\"],[4,\"if\",[[25,\"eq\",[[20,[\"match\",\"away_team\",\"code\"]],\"TBD\"],null]],null,{\"statements\":[[0,\"      \"],[6,\"b\"],[7],[0,\"TBD\"],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[1,[25,\"uppercase\",[[20,[\"match\",\"away_team\",\"player_name\"]]],null],false],[0,\" – \"],[6,\"b\"],[7],[1,[25,\"uppercase\",[[20,[\"match\",\"away_team\",\"country\"]]],null],false],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"  \"],[8],[0,\"\\n  \"],[6,\"div\"],[7],[0,\"\\n    \"],[6,\"img\"],[9,\"class\",\"upcoming-match-flag\"],[10,\"src\",[26,[\"https://raw.githubusercontent.com/nolaneo/wc2018/master/public/assets/images/flags/\",[25,\"dasherize\",[[25,\"lowercase\",[[20,[\"match\",\"away_team\",\"country\"]]],null]],null],\".png\"]]],[7],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/components/upcoming-match.hbs" } });
});
define("wc2018/templates/sweepstake", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "b9yP5X9p", "block": "{\"symbols\":[],\"statements\":[[6,\"div\"],[9,\"class\",\"layout__box o__flexes-to-1 o__has-rows main-content\"],[7],[0,\"\\n  \"],[1,[25,\"pool-table\",null,[[\"players\",\"filterPlayer\",\"toggleFilter\"],[[20,[\"model\"]],[20,[\"filterPlayer\"]],[25,\"action\",[[19,0,[]],\"toggleFilter\"],null]]]],false],[0,\"\\n  \"],[1,[25,\"live-matches\",null,[[\"players\"],[[20,[\"model\"]]]]],false],[0,\"\\n  \"],[1,[25,\"past-matches\",null,[[\"players\",\"filterPlayer\"],[[20,[\"model\"]],[20,[\"filterPlayer\"]]]]],false],[0,\"\\n  \"],[1,[25,\"match-list\",null,[[\"players\",\"filterPlayer\"],[[20,[\"model\"]],[20,[\"filterPlayer\"]]]]],false],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "wc2018/templates/sweepstake.hbs" } });
});
define('wc2018/utils/titleize', ['exports', 'ember-cli-string-helpers/utils/titleize'], function (exports, _titleize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _titleize.default;
    }
  });
});


define('wc2018/config/environment', [], function() {
  var prefix = 'wc2018';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

if (!runningTests) {
  require("wc2018/app")["default"].create({"name":"wc2018","version":"0.0.0+a1b1d48a"});
}
//# sourceMappingURL=wc2018.map
