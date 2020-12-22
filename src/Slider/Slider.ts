interface ISliderOptions {
  rootContainerSelector: string;
  navButtons?: [string, string]; // [prev, next]
}

type TMEvent = TouchEvent | MouseEvent;

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

  // if slide is being dragged by mouse, this variable is used as a flag
  // to prevent infinite adding of event listener in onTouchStart method
  private mouseMoveEventActive = false;

  // bind returns NEW function, thus removeListener could not remove listener
  // removableEvtHandlers stores binded functions to use inlisteners where needed.
  private removableEvtHandlers = {
    ontm: this.onTouchMove.bind(this),
  }

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

      s.addEventListener('mousedown', this.onTouchStart.bind(this));
      s.addEventListener('mouseup', this.onTouchEnd.bind(this));
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

  private isTargetASlide(e: TMEvent) {
    return this.slides.includes(e.target as HTMLElement);
  }

  private getTargetTransform(e: TMEvent) {
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

  private onTouchStart(e: TMEvent) {
    this.touchStartPos = 'touches' in e ? e.touches[0].clientX : e.clientX;

    if('touches' in e === false && !this.mouseMoveEventActive) {
      e.preventDefault();
      this.slides.forEach(s => {
        s.addEventListener('mousemove', this.removableEvtHandlers.ontm);
      });
      this.mouseMoveEventActive = true;
    }

    this.currentTargetPos = this.getTargetTransform(e);
    console.log('START', this.touchStartPos, this.currentTargetPos);
  }
  private onTouchMove(e: TMEvent) {
    let clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    this.delta = this.touchStartPos - clientX;

    if('touches' in e === false && (clientX <= this.rootContainer.getBoundingClientRect().x + 40)) {
      this.slides.forEach(s => {
        s.removeEventListener('mousemove', this.removableEvtHandlers.ontm);
      });
      this.completeSlide('left');
      this.mouseMoveEventActive = false;
      return;
    } else if('touches' in e === false && (clientX >= this.rootContainer.getBoundingClientRect().x + this.slides[0].offsetWidth - 40)) {
      this.slides.forEach(s => {
        s.removeEventListener('mousemove', this.removableEvtHandlers.ontm);
      });
      this.completeSlide('right');
      this.mouseMoveEventActive = false;
      return;
    }

    this.slides.forEach(s => {
      s.style.transform = `translateX(${this.currentTargetPos - this.delta}px)`;
    });
    // console.log('MOVE', this.delta);
  }
  private onTouchEnd(e: TMEvent) {
    this.touchEndPos = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    if('touches' in e === false && this.mouseMoveEventActive || (this.touchEndPos < (e.target as HTMLElement).getBoundingClientRect().x)) {
      console.log('mouseup')
      this.slides.forEach(s => {
        s.removeEventListener('mousemove', this.removableEvtHandlers.ontm);
      });
      this.mouseMoveEventActive = false;
    }
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