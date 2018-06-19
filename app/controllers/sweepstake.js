import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject } from '@ember/service';

export default Controller.extend({
  ajax: inject(),
  apiURL: 'https://world-cup-json.herokuapp.com/matches',
  fetchTask: task(function * () {
    return yield this.get('ajax').request(this.get('apiURL'));
  }).enqueue(),
});
