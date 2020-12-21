interface ISliderOptions {
  rootContainerSelector: string;
  navButtons?: [string, string]; // [prev, next]
}

export class Slider {
  private rootContainer: HTMLElement;
  private navNextBtn: HTMLElement | null = null; 
  private navPrevBtn: HTMLElement | null = null; 
  private slides: HTMLElement[];

  private touchStartPos: number = 0;
  private touchEndPos: number = 0;
  private currentTargetPos: number = 0;
  private delta: number = 0;
  private currentSlideIndex: number = 0;

  constructor(opts: ISliderOptions) {
    this.rootContainer = document.querySelector(opts.rootContainerSelector) as HTMLElement;
    this.slides = Array.from(this.rootContainer.children) as HTMLElement[];

    if(opts.navButtons) {
      this.navPrevBtn = document.querySelector(opts.navButtons[0]);
      this.navNextBtn = document.querySelector(opts.navButtons[1]);
    }
  }

  public initSlider() {
    this.setInitStyles();
    this.setListeners();
  }

  private setListeners() {
    this.slides.forEach(s => {
      s.addEventListener('touchstart', this.onTouchStart.bind(this));
      s.addEventListener('touchmove', this.onTouchMove.bind(this));
      s.addEventListener('touchend', this.onTouchEnd.bind(this));
    });

    if(this.navNextBtn && this.navPrevBtn) {
      this.navNextBtn.addEventListener('click', () => {
        this.completeSlide('left');
      });
      this.navPrevBtn.addEventListener('click', () => {
        this.completeSlide('right');
      });
    }
  }

  private setInitStyles() {
    this.rootContainer.style.display = 'flex';
    this.rootContainer.style.overflow = 'hidden';
    this.rootContainer.style.position = 'relative';

    this.slides.forEach(s => {
      s.style.width = '100%';
      s.style.height = 'inherit';
      s.style.flexShrink = '0';
      s.style.transform = `translateX(${0}px)`;
      s.style.transition = 'transform .25s';
    });
  }

  private isTargetASlide(e: TouchEvent) {
    // console.log('target is: ', e.target);
    return this.slides.includes(e.target as HTMLElement);
  }

  private getTargetTransform(e: TouchEvent) {
    if(this.isTargetASlide(e)) {
      return parseInt(Array.from((e.target as HTMLElement).style.transform.match(/[-0-9]+/)!)[0]);
    } else {
      return 0;
    }
  }

  private getDirection(direction?: 'left' | 'right') {
    let dir: 'left' | 'right' | 'still';

    if(direction) {
      dir = direction;
    } else if(this.touchEndPos === this.touchStartPos) {
      dir = 'still';
    } else {
      dir = this.touchEndPos > this.touchStartPos ? 'right' :'left';
    }

    return dir;
  }

  private onTouchStart(e: TouchEvent) {
    this.touchStartPos = e.touches[0].clientX;
    this.currentTargetPos = this.getTargetTransform(e);
    console.log('START', this.touchStartPos, this.currentTargetPos);
  }
  private onTouchMove(e: TouchEvent) {
    let { clientX } = e.touches[0];
    this.delta = this.touchStartPos - clientX;

    this.slides.forEach(s => {
      s.style.transform = `translateX(${this.currentTargetPos - this.delta}px)`;
    });
    // console.log('MOVE', this.delta);
  }
  private onTouchEnd(e: TouchEvent) {
    this.touchEndPos = e.changedTouches[0].clientX;
    this.completeSlide();
    console.log('END', this.touchEndPos);
  }

  private completeSlide(direction?: 'left' | 'right') {
    const dir = direction ? direction : this.getDirection();
    const slideWidth = this.slides[0].offsetWidth;
    this.delta = Math.abs(this.delta);

    if(dir === 'right' && this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    } else if(dir === 'left' && this.currentSlideIndex < this.slides.length - 1) {
      this.currentSlideIndex++;
    } 

    this.slides.forEach(s => {
      if(this.delta < 80 && !direction) {
        s.style.transform = `translateX(${this.currentTargetPos}px)`;
        return;
      } else {
        s.style.transform = `translateX(${-slideWidth * this.currentSlideIndex}px)`;
      }
    });
  }
}