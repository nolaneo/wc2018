import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject } from '@ember/service';

export default Component.extend({
  ajax: inject(),

  apiURL: 'http://worldcup.sfg.io/matches',

  didInsertElement() {
    this._super(...arguments);
    this.get('fetchMatches').perform();
    let teamToPlayerSet = {};
    this.get('players').map(player => {
      player.teams.map(team => teamToPlayerSet[team] = player.name);
    });
    this.set('teamToPlayerSet', teamToPlayerSet);
  },

  fetchMatches: task(function * () {
    let data = yield this.get('ajax').request(this.get('apiURL'));
    let matches = data
      .filter(match => match.status === this.get('filtering'))
      .filter(match => match.home_team.code !== "TBD" || match.away_team.code !== "TBD");
    this.set('matches', this.injectPlayerName(matches));
  }),

  injectPlayerName(matchArray) {
    return matchArray.map(match => {
      match.home_team.player_name = this.get('teamToPlayerSet')[match.home_team.country];
      match.away_team.player_name = this.get('teamToPlayerSet')[match.away_team.country];
      return match;
    })
  },

});
