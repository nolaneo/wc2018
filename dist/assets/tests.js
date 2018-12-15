'use strict';

define('wc2018/tests/app.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | app');

  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });

  QUnit.test('components/live-match.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/live-match.js should pass ESLint\n\n');
  });

  QUnit.test('components/live-matches.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/live-matches.js should pass ESLint\n\n');
  });

  QUnit.test('components/match-component.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/match-component.js should pass ESLint\n\n');
  });

  QUnit.test('components/match-list.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/match-list.js should pass ESLint\n\n');
  });

  QUnit.test('components/match-stats.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/match-stats.js should pass ESLint\n\n26:9 - Unexpected console statement. (no-console)\n27:9 - Unexpected console statement. (no-console)\n28:9 - Unexpected console statement. (no-console)');
  });

  QUnit.test('components/past-match.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/past-match.js should pass ESLint\n\n');
  });

  QUnit.test('components/past-matches.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/past-matches.js should pass ESLint\n\n');
  });

  QUnit.test('components/pool-table-row.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/pool-table-row.js should pass ESLint\n\n');
  });

  QUnit.test('components/pool-table.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/pool-table.js should pass ESLint\n\n');
  });

  QUnit.test('components/upcoming-match.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/upcoming-match.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/sweepstake.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/sweepstake.js should pass ESLint\n\n');
  });

  QUnit.test('data/matches.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'data/matches.js should pass ESLint\n\n');
  });

  QUnit.test('data/sweeps/college.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'data/sweeps/college.js should pass ESLint\n\n');
  });

  QUnit.test('data/sweeps/intercom.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'data/sweeps/intercom.js should pass ESLint\n\n');
  });

  QUnit.test('data/teams.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'data/teams.js should pass ESLint\n\n');
  });

  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });

  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });

  QUnit.test('routes/sweepstake.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/sweepstake.js should pass ESLint\n\n');
  });

  QUnit.test('services/match-service.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'services/match-service.js should pass ESLint\n\n104:11 - Unexpected console statement. (no-console)\n115:11 - Unexpected console statement. (no-console)');
  });
});
define('wc2018/tests/integration/components/live-matches-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  (0, _qunit.module)('Integration | Component | live-matches', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "jggUoPQ7",
        "block": "{\"symbols\":[],\"statements\":[[1,[18,\"live-matches\"],false]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "/moJXxxl",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"live-matches\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define('wc2018/tests/integration/components/match-component-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  (0, _qunit.module)('Integration | Component | match-component', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "SmkCKWVt",
        "block": "{\"symbols\":[],\"statements\":[[1,[18,\"match-component\"],false]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "F/pJxfLM",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"match-component\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define('wc2018/tests/integration/components/match-list-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  (0, _qunit.module)('Integration | Component | match-list', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "WTmLbjw2",
        "block": "{\"symbols\":[],\"statements\":[[1,[18,\"match-list\"],false]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "IlEQxwGL",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"match-list\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define('wc2018/tests/integration/components/match-stats-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  (0, _qunit.module)('Integration | Component | match-stats', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "mkkKvMdX",
        "block": "{\"symbols\":[],\"statements\":[[1,[18,\"match-stats\"],false]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "2QSDXG54",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"match-stats\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define('wc2018/tests/integration/components/past-match-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  (0, _qunit.module)('Integration | Component | past-match', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "Vtg/uYYX",
        "block": "{\"symbols\":[],\"statements\":[[1,[18,\"past-match\"],false]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "c+35Ba8t",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"past-match\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define('wc2018/tests/integration/components/past-matches-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  (0, _qunit.module)('Integration | Component | past-matches', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "LjF5e3t5",
        "block": "{\"symbols\":[],\"statements\":[[1,[18,\"past-matches\"],false]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "unR3p1+Z",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"past-matches\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define('wc2018/tests/integration/components/pool-table-row-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  (0, _qunit.module)('Integration | Component | pool-table-row', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "qKJpN4eb",
        "block": "{\"symbols\":[],\"statements\":[[1,[18,\"pool-table-row\"],false]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "iXqqZ738",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"pool-table-row\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define('wc2018/tests/integration/components/pool-table-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  (0, _qunit.module)('Integration | Component | pool-table', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "dQdm7Zwc",
        "block": "{\"symbols\":[],\"statements\":[[1,[18,\"pool-table\"],false]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "+DhaJVKT",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"pool-table\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define('wc2018/tests/integration/components/upcoming-match-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  (0, _qunit.module)('Integration | Component | upcoming-match', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "cUvhwE+6",
        "block": "{\"symbols\":[],\"statements\":[[1,[18,\"upcoming-match\"],false]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), '');

      // Template block usage:
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "vWTALV/f",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"upcoming-match\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define('wc2018/tests/test-helper', ['wc2018/app', 'wc2018/config/environment', '@ember/test-helpers', 'ember-qunit'], function (_app, _environment, _testHelpers, _emberQunit) {
  'use strict';

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));

  (0, _emberQunit.start)();
});
define('wc2018/tests/tests.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | tests');

  QUnit.test('integration/components/live-matches-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/live-matches-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/match-component-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/match-component-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/match-list-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/match-list-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/match-stats-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/match-stats-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/past-match-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/past-match-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/past-matches-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/past-matches-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/pool-table-row-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/pool-table-row-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/pool-table-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/pool-table-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/upcoming-match-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/upcoming-match-test.js should pass ESLint\n\n');
  });

  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/sweepstake-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/sweepstake-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/sweepstake-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/sweepstake-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/services/match-fetching-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/match-fetching-test.js should pass ESLint\n\n');
  });
});
define('wc2018/tests/unit/controllers/sweepstake-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Controller | sweepstake', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:sweepstake');
      assert.ok(controller);
    });
  });
});
define('wc2018/tests/unit/routes/sweepstake-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Route | sweepstake', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:sweepstake');
      assert.ok(route);
    });
  });
});
define('wc2018/tests/unit/services/match-fetching-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Service | match-fetching', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      let service = this.owner.lookup('service:match-fetching');
      assert.ok(service);
    });
  });
});
define('wc2018/config/environment', [], function() {
  var prefix = 'wc2018';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

require('wc2018/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
