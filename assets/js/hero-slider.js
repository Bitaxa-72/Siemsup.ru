(function exposeHeroSlider(globalScope) {
  const shouldHeroPause = ({ reducedMotion, documentHidden }) => reducedMotion || documentHidden;

  const createHeroSliderState = ({
    count,
    onChange,
    delay = 6000,
    schedule = setTimeout,
    cancel = clearTimeout,
  }) => {
    let index = 0;
    let timer = null;

    const stop = () => {
      if (timer !== null) cancel(timer);
      timer = null;
    };

    const queue = () => {
      stop();
      timer = schedule(() => {
        timer = null;
        index = (index + 1) % count;
        onChange(index);
        queue();
      }, delay);
    };

    const select = (nextIndex) => {
      index = nextIndex;
      onChange(index);
      queue();
    };

    return { start: queue, stop, select };
  };

  globalScope.createHeroSliderState = createHeroSliderState;
  globalScope.shouldHeroPause = shouldHeroPause;
  if (typeof module !== 'undefined') module.exports = { createHeroSliderState, shouldHeroPause };
}(typeof window === 'undefined' ? globalThis : window));
