import MatchList from './match-list';

export default MatchList.extend({
  filtering: 'completed',
  isOpen: false,
  actions: {
    toggle() {
      this.toggleProperty('isOpen');
    }
  }
});
