import Component from '@ember/component';
import { inject }  from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({

  matchService: inject(),

  filtering: 'future',

  matches: computed('matchService.matches.[]', function() {
    return this.get('matchService.matches').filter(match => match.status === this.get('filtering'));
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
  })

});
