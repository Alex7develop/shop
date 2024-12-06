export default class ControllSlHead {
    constructor(d) {
        this.d = d
        this.slider = d.slider;
        this.initSlider = d.initSlider;

        this.click = this.click.bind(this);
        this.touchStart = this.touchStart.bind(this);
        this.touchEnd = this.touchEnd.bind(this);
    }

    init() { 
        this.d.initSlider();
        this.d.slider.addEventListener('click', this.click);
        this.d.slider.addEventListener('touchstart', this.touchStart, {passive: true});
        this.d.slider.addEventListener('touchend', this.touchEnd, {passive: true})
    }

    click(e) { 
        // NEXT клик по стрелке
        if(e.target.closest('.slider__arrow-next')) {
           this.d.moveNext();
        }

        // PREV клик по стрелке
        if(e.target.closest('.slider__arrow-prev')) {
            this.d.movePrev();
        }

        if(e.target.closest('.slider-h__pagination-item')) {
            this.d.clickPag(e.target.closest('.slider-h__pagination-item'));
        }
    }

    touchStart(e) {
        this.d.touchStart = e.targetTouches[0].clientX;
    }

    touchEnd(e) {
        this.d.touchEnd = e.changedTouches[0].clientX;
        this.d.changeVideoWithSwipe();
    }
}