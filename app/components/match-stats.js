import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['layout__box', 'o__flexes-to-1', 'o__has-rows', 'u__pad__50', 'stat-table'],
  classNameBindings: ['hasNoEvents:u__hidden'],
  hasNoEvents: computed.empty('events'),
  events: computed('match.{home_team_events,away_team_events}', function() {
    this.get('match.home_team_events').setEach('side', 'home');
    this.get('match.away_team_events').setEach('side', 'away');
    let events = this.get('match.home_team_events').concat(this.get('match.away_team_events'));
    return events.sortBy('time');
  }),
});
