import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject } from '@ember/service';

export default Controller.extend({  
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
