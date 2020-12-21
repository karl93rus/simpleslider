import { Slider } from './Slider/Slider';

const sl = new Slider({
  rootContainerSelector: '.slider-root',
  navButtons: ['.nav-left', '.nav-right'],
});

sl.initSlider();

