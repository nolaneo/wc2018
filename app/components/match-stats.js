import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['layout__box', 'o__flexes-to-1', 'o__has-rows', 'stat-table'],
  classNameBindings: ['hasNoEvents:u__hidden'],
  hasNoEvents: computed.empty('events'),
  events: computed('match.{home_team_events,away_team_events}', function() {
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
    })
    events = events.reduce((accumulator, event) => {
      let lastEvent = (accumulator.get('lastObject') || {});
      if (lastEvent.player == event.player && lastEvent.type_of_event == event.type_of_event && (Math.abs(lastEvent.integerTime - event.integerTime) <= 1)) {
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
