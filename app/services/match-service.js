import Service, { inject }  from '@ember/service';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import teamData from 'wc2018/data/teams';

export default Service.extend({
  ajax: inject(),
  apiURL: 'https://world-cup-json.herokuapp.com/matches',

  initialFetchRunning: computed.alias('initialMatchFetch.isRunning'),
  isRunning: computed.alias('fetchMatches.isRunning'),

  init() {
    this._super(...arguments);
    this.set('matches', []);
  },

  futureMatches: computed('matches.[]', function() {
    return this.get('matches').filter(match => match.status === 'future');
  }),

  liveMatches: computed('matches.[]', function() {
    return this.get('matches').filter(match => match.status === 'in progress');
  }),

  start(players) {
    this.set('players', players);
    this.get('fetchMatches').perform();
    this.get('initialMatchFetch').perform();
    this.set('clockTime', 30);
  },

  initialMatchFetch: task(function * () {
    yield this.get('fetchMatches').perform();
    this.get('pollResults').perform();
  }),

  teamToPlayerSet: computed('players.[]', function() {
    let teamToPlayerSet = {};
    this.get('players').forEach(player => {
      player.teams.map(team => teamToPlayerSet[team] = player);
    });
    return teamToPlayerSet;
  }),

  fetchMatches: task(function * () {
    let data =  yield this.get('fetchTask').perform();
    let matches = this.injectGameStages(data).sortBy('datetime');
    matches = this.injectPlayerName(matches);
    this.set('matches', matches);
  }),

  pollResults: task(function * () {
    while (this.get('clockTime') > 0) {
      yield timeout(1000);
      this.decrementProperty('clockTime');
    }
    yield this.get('fetchMatches').perform();
    this.set('clockTime', 30);
    this.get('pollResults').perform();
  }),

  fetchTask: task(function * () {
    if (this.get('runningTask')) {
      return yield this.get('runningTask');
    } else {
      let task = this.get('doFetch').perform();
      this.set('runningTask', task);
      return yield task;
    }
  }),

  doFetch: task(function * () {
    let result = yield this.get('ajax').request(this.get('apiURL'));
    this.set('runningTask', null);
    return result;
  }),

  filterMatches(status) {
    return this.get('matches').filter(match => match.status === status);
  },

  injectGameStages(matchArray) {
    return matchArray.map((match) => {
      if (match.stage_name == 'First stage') {
        match.stage = `Group ${teamData.findBy('country', match.home_team_country).group_letter}`;
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
          let oldMatch = (matchArray[teamIndex] || {});
          let team = oldMatch.winner || "To be determined";
          match.home_team_country = team;
          match.home_team.country = team;
          match.home_team.code = null;
          console.log(`Injected ${team} as participant for ${match.stage_name} from ${oldMatch.home_team_country} v ${oldMatch.away_team_country}`);
        }
      }
      if (match.away_team.team_tbd) {
        let teamIndex = Number.parseInt(match.away_team.team_tbd.replace('W', '')) - 1;
        if (matchArray[teamIndex]) {
          let oldMatch = (matchArray[teamIndex] || {});
          let team = oldMatch.winner || "To be determined";
          match.away_team_country = team;
          match.away_team.country = team;
          match.home_team.code = null;
          console.log(`Injected ${team} as participant for ${match.stage_name} from ${oldMatch.home_team_country} v ${oldMatch.away_team_country}`);
        }
      }
      match.home_team.player_name = this.playerNameForCountry(match.home_team_country);
      match.away_team.player_name = this.playerNameForCountry(match.away_team_country);
      return match;
    })
  },

  playerNameForCountry(country) {
    let player = this.get('teamToPlayerSet')[country];
    return player ? player.name : '';
  }

});
