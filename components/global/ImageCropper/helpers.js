import Animated, { add } from 'react-native-reanimated';

const {
  Clock,
  Value,
  block,
  cond,
  stopClock,
  set,
  startClock,
  clockRunning,
  not,
  timing: reTiming,
} = Animated;


const animate=({
  fn,
  clock,
  state,
  config,
  from,
}) =>
  block([
    cond(not(clockRunning(clock)), [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, from),
      startClock(clock),
    ]),
    fn(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ]);

export const timing = (params) => {
  const { clock, easing, duration, from, to } = {
    clock: new Clock(),
    duration: 250,
    from: 0,
    to: 1,
    easing: (v) => add(v, 0),
    ...params,
  };

  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    toValue: new Value(0),
    duration,
    easing,
  };

  return block([
    cond(not(clockRunning(clock)), [
      set(config.toValue, to),
      set(state.frameTime, 0),
    ]),
    animate({
      clock,
      fn: reTiming,
      state,
      config,
      from,
    }),
  ]);
};

export const getPercentFromNumber = (percent, numberFrom) =>
  (numberFrom / 100) * percent;

export const getPercentDiffNumberFromNumber = (
  number,
  numberFrom,
) => (number / numberFrom) * 100;