import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { computed } from '@ember/object';

export default Component.extend({

  filtering: 'future',

  didInsertElement() {
    this._super(...arguments);
    this.get('fetchMatches').perform();
    let teamToPlayerSet = {};
    this.get('players').map(player => {
      player.teams.map(team => teamToPlayerSet[team] = player.name);
    });
    this.set('teamToPlayerSet', teamToPlayerSet);
    this.get('initialMatchFetch').perform();
    this.set('clockTime', 10);
  },

  initialMatchFetch: task(function * () {
    yield this.get('fetchMatches').perform();
    this.get('pollResults').perform();
  }),

  pollResults: task(function * () {
    while (this.get('clockTime') > 0) {
      yield timeout(1000);
      this.decrementProperty('clockTime');
    }
    yield this.get('fetchMatches').perform();
    this.set('clockTime', 10);
    this.get('pollResults').perform();
  }),

  fetchMatches: task(function * () {
    let data =  yield this.get('fetchTask').perform();
    let matches = data
      .filter(match => match.status === this.get('filtering'))
      .filter(match => match.home_team.code !== "TBD" || match.away_team.code !== "TBD")
      .sortBy('datetime');
    this.set('matches', this.injectPlayerName(matches));
  }),

  matchesFilteredByPlayer: computed('matches.[]', 'filterPlayer', function() {
    let filterPlayer = this.get('filterPlayer');
    if (filterPlayer) {
      return this.get('matches').filter(match => {
        return match.home_team.player_name === filterPlayer || match.away_team.player_name === filterPlayer;
      });
    } else {
      return this.get('matches');
    }
  }),

  injectPlayerName(matchArray) {
    return matchArray.map(match => {
      match.home_team.player_name = this.get('teamToPlayerSet')[match.home_team.country];
      match.away_team.player_name = this.get('teamToPlayerSet')[match.away_team.country];
      return match;
    })
  },

});
