import Controller from '@ember/controller';

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
