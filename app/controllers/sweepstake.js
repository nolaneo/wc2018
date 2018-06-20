import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject } from '@ember/service';

export default Controller.extend({
  ajax: inject(),
  apiURL: 'https://world-cup-json.herokuapp.com/matches',
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
