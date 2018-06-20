import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: 'tr',
  classNames: ['pool-table-row'],
  classNameBindings: ['isFilteringByPlayer:o__is-filtering'],
  isFilteringByPlayer: computed('player', 'filterPlayer', function() {
    return this.get('filterPlayer') === this.get('player.name');
  }),
  click() {
    this.get('toggleFilter')(this.get('player.name'));
  }
});
