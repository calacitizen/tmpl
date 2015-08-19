var State = (function StateFunction() {
  'use strict';

  if (typeof setImmediate !== 'function') {
    setImmediate = function setImmediate(func, fate) {
      'use strict';
      return setTimeout(function setTimeoutHandle() {
        func(fate);
      }, 0);
    };
  }

  function enlighten(queue, fate) {
    queue.forEach(function queueForEach(func) {
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
        state // A state that provides the resolution functions
      ) {
        var queue = resolution === 'keep' ? keepers : breakers;
        queue[queue.length] = typeof func !== 'function'

        ? state[resolution]: function enqueueResolution(value) {
          try {
            var result = func(value);
            if (result && result.is_promise === true) {
              result.when(state.keep, state.break);
            } else {
              state.keep(result);
            }
          } catch (e) {
            state.break(e);
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
            var state = make();
            switch (status) {
              case 'pending':
                enqueue('keep', kept, state);
                enqueue('break', broken, state);
                break;
              case 'kept':
                enqueue('keep', kept, state);
                enlighten(keepers, fate);
                break;
              case 'broken':
                enqueue('break', broken, state);
                enlighten(breakers, fate);
                break;
            }
            return state.promise;
          }
        }
      };
    },
    every: function every(array) {
      var remaining = array.length,
        results = [],
        state = State.make();

      if (!remaining) {
        state.break(array);
      } else {
        array.forEach(function everyPromiseEach(promise, i) {
          promise.when(function everyProiseWhen(value) {
            results[i] = value;
            remaining -= 1;
            if (remaining === 0) {
              state.keep(results);
            }
          }, function everyProiseWhenBroke(reason) {
            remaining = NaN;
            state.break(reason);
          });
        });
      }
      return state.promise;
    },
    first: function first(array) {
      var found = false,
        remaining = array.length,
        state = State.make();

      function check() {
        remaining -= 1;
        if (remaining === 0 && !found) {
          state.break();
        }
      }

      if (remaining === 0) {
        state.break(array);
      } else {
        array.forEach(function firstPromiseEach(promise) {
          promise.when(function firstProiseWhen(value) {
            if (!found) {
              found = true;
              state.keep(value);
            }
            check();
          }, check);
        });
      }
      return state.promise;
    },
    any: function any(array) {
      var remaining = array.length,
        results = [],
        state = State.make();

      function check() {
        remaining -= 1;
        if (remaining === 0) {
          state.keep(results);
        }
      }

      if (!remaining) {
        state.keep(results);
      } else {
        array.forEach(function anyPromiseEach(promise, i) {
          promise.when(function anyProiseWhen(value) {
            results[i] = value;
            check();
          }, check);
        });
      }
      return state.promise;
    },
    kept: function kept(value) {
      var state = State.make();
      state.keep(value);
      return state.promise;
    },
    broken: function broken(reason) {
      var state = State.make();
      state.break(reason);
      return state.promise;
    }
  };
}());

module.exports = State;
