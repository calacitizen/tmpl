var VOW = (function() {
  'use strict';

  function enlighten(queue, fate) {
    queue.forEach(function queueForEach(func) {
      if (typeof setImmediate !== 'function') {
        setImmediate = function setImmediate(func, fate) {
          'use strict';
          return setTimeout(function setTimeoutHandle() {
            func(fate);
          }, 0);
        };
      }
      setImmediate(func, fate);
    });
  }

  return {
    make: function make() {
      var breakers = [], // .when's broken queue
        fate, // The promise's ultimate value
        keepers = [], // .when's kept queue
        status = 'pending'; // 'broken', 'kept', or 'pending'

      function enqueue(
        resolution, // 'keep' or 'break'
        func, // A function that was registered with .when
        vow // A vow that provides the resolution functions
      ) {
        var queue = resolution === 'keep' ? keepers : breakers;
        queue[queue.length] = typeof func !== 'function'

        ? vow[resolution]: function enqueueResolution(value) {
          try {
            var result = func(value);
            if (result && result.is_promise === true) {
              result.when(vow.keep, vow.break);
            } else {
              vow.keep(result);
            }
          } catch (e) {
            vow.break(e);
          }
        };
      }

      function herald(state, value, queue) {
        if (status !== 'pending') {
          throw "overpromise";
        }
        fate = value;
        status = state;
        enlighten(queue, fate);
        keepers.length = 0;
        breakers.length = 0;
      }
      return {
        'break': function breakPromise(value) {
          herald('broken', value, breakers);
        },
        keep: function keep(value) {
          herald('kept', value, keepers);
        },
        promise: {
          is_promise: true,
          when: function when(kept, broken) {
            var vow = make();
            switch (status) {
              case 'pending':
                enqueue('keep', kept, vow);
                enqueue('break', broken, vow);
                break;
              case 'kept':
                enqueue('keep', kept, vow);
                enlighten(keepers, fate);
                break;
              case 'broken':
                enqueue('break', broken, vow);
                enlighten(breakers, fate);
                break;
            }
            return vow.promise;
          }
        }
      };
    },
    every: function every(array) {
      var remaining = array.length,
        results = [],
        vow = VOW.make();

      if (!remaining) {
        vow.break(array);
      } else {
        array.forEach(function everyPromiseEach(promise, i) {
          promise.when(function everyProiseWhen(value) {
            results[i] = value;
            remaining -= 1;
            if (remaining === 0) {
              vow.keep(results);
            }
          }, function everyProiseWhenBroke(reason) {
            remaining = NaN;
            vow.break(reason);
          });
        });
      }
      return vow.promise;
    },
    first: function first(array) {
      var found = false,
        remaining = array.length,
        vow = VOW.make();

      function check() {
        remaining -= 1;
        if (remaining === 0 && !found) {
          vow.break();
        }
      }

      if (remaining === 0) {
        vow.break(array);
      } else {
        array.forEach(function firstPromiseEach(promise) {
          promise.when(function firstProiseWhen(value) {
            if (!found) {
              found = true;
              vow.keep(value);
            }
            check();
          }, check);
        });
      }
      return vow.promise;
    },
    any: function any(array) {
      var remaining = array.length,
        results = [],
        vow = VOW.make();

      function check() {
        remaining -= 1;
        if (remaining === 0) {
          vow.keep(results);
        }
      }

      if (!remaining) {
        vow.keep(results);
      } else {
        array.forEach(function anyPromiseEach(promise, i) {
          promise.when(function anyProiseWhen(value) {
            results[i] = value;
            check();
          }, check);
        });
      }
      return vow.promise;
    },
    kept: function kept(value) {
      var vow = VOW.make();
      vow.keep(value);
      return vow.promise;
    },
    broken: function broken(reason) {
      var vow = VOW.make();
      vow.break(reason);
      return vow.promise;
    }
  };
}());

module.exports = VOW;
