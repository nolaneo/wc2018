import Component from '@ember/component';
import matches from 'wc2018/data/matches';

export default Component.extend({
  didInsertElement() {
    this._super(...arguments);
    let teamToPlayerSet = {};
    this.get('players').map(player => {
      player.teams.map(team => teamToPlayerSet[team] = player.name);
    });
    this.set('teamToPlayerSet', teamToPlayerSet);
    let fixtures = matches.map(match => {
      let fixture = Object.assign({}, match);
      fixture.homePlayer = teamToPlayerSet[match.homeTeam];
      fixture.awayPlayer = teamToPlayerSet[match.awayTeam];
      return fixture;
    })
    this.set('fixtures', fixtures);
  }
});
