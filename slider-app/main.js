/*
* widget for owl-carousel slider
* */

import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel'

class SliderWidget {
  constructor(options) {
    this.options = options
  }

  /*--------------
  * parse options
  *-------------*/
  set options(values) {
    this.sliderEl = values.el
    this.sliderOptions = values.sliderOptions
    this.sliderNavLeft = values.navLeft
    this.sliderNavRight = values.navRight
  }

  initSlider() {
    document.addEventListener("DOMContentLoaded", () => {
      const slider = $(`.${this.sliderEl} .owl-carousel`).owlCarousel(this.sliderOptions)

      // init buttons
      $(`.${this.sliderEl}` + ` .${this.sliderNavLeft}`).click(function() {slider.trigger('prev.owl.carousel')});
      $(`.${this.sliderEl}` + ` .${this.sliderNavRight}`).click(function() {slider.trigger('next.owl.carousel')});
    })
  }

}

// add modal class to global object Window
window.SliderWidget = SliderWidget
