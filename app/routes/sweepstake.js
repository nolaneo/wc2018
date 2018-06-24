import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import intercomSweepstake from 'wc2018/data/sweeps/intercom';
import collegeSweepstake from 'wc2018/data/sweeps/college';

export default Route.extend({
  matchService: inject(),

  model(path) {
    if (path.id === 'intercom') {
      return intercomSweepstake;
    } else {
      return collegeSweepstake;
    }
  },

  afterModel(model) {
    this.get('matchService').start(model);
  }
});
