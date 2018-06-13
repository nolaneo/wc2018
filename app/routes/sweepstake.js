import Route from '@ember/routing/route';
import intercomSweepstake from 'wc2018/data/sweeps/intercom';
import collegeSweepstake from 'wc2018/data/sweeps/college';

export default Route.extend({
  model(path) {
    if (path.id === 'intercom') {
      return intercomSweepstake;
    } else {
      return collegeSweepstake;
    }
  }
});
