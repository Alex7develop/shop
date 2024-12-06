export default class RedrawSLP {
    constructor(el, data) {
        this.el = el;
        this.data = data;
        this.arrows = this.el.querySelectorAll('.slider__arrow');
        this.cardDecoL = this.el.querySelector('.sl-p__slide-item_l');
        this.cardDecoR = this.el.querySelector('.sl-p__slide-item_r');
        this.itemsList = null;
     
        this.items = null;
        this.cards = null;

        this.inSideSliders = this.el.querySelectorAll('.sl-p__card-wr-slider');

        this.prevCard = null;
        this.activeCard = null;
        this.nextCard = null;

        this.activeCardSlider = null; // слайдер внутри активной карточки (большой, основного слайда)
        this.activeCardSlidesList = null;
        this.activePaginationList = null;
        this.activeColorPag = null;

        this.activeSize = null;

        this.duration = 0.5; 
        this.durationMobile = 0.3;
        this.timeF = 'linear';
        
        // ==== ---Для мобилной версии // внешний слайдер
        this.widthSlide = null; // ширина слайда
        this.initOffsetVW = null; // стартовый сдвиг слайдов vw
        this.gap = null;
        this.sizeMobileOffset = null; // расчитанная велечина смещения при клике на стрелку
        // => swipe внешний слайдер
        this.swipeStart = null;
        this.currentSwipe = null; // насколько уже сдвинут слайд когда touchend
        this.currentOffset = null; // текущий сдвиг слайдов в моменте до touchend
        this.startTimeStamp
        this.durationSwipe = null; // расчитанное время свайпа когда косание окончено для завершения сдвига
        this.touchMoved = null; // сдвиг блока со слайдами до touchend
        this.relocated = false; // если true значит в начало блока подставлен слайд (false проставляется только по окончании свайпа в конце анимации)

        //  => swipe внутренний слайдер
        this.swipeCardStart = null;
        this.currentCardOffset = null; // текущее положение списка слайдов, от которого будет происходить сдвиг и становиться на место
        this.startTimeStampCard = null;
        this.touchMovedCard = null;
        this.relocatedCard = false;
        this.widthCardSlide = null;
        this.activeSwipeCardItem = null; // item на котором сработал touchstart (на котором стоит палец или стилус)

        this.stoped = false;
    }

    // !!!!!!!! количество карточек для внешнего слайдера должно быть больше трех

    // работает на основе абсолютного позиционирования
    initSlider() {
        // перебираем json и элементы вставляем this.cardDecoR.before(...)
        // и там уже для элемента определяем все что в this.items.forEach(
        // в конце initSlider определяем this.list и this.items

        // Формируем карточки
        this.data.forEach((item, index) => {
            const el = this.patternCard(item);

            if(innerWidth > 1200) {
                el.style.transition = `
                left ${this.duration}s ${this.timeF},
                transform ${this.duration}s ${this.timeF},
                opacity  ${this.duration}s ${this.timeF}`;
            }
            
            switch (index) {
                case 0:
                    this.prevCard = el;
                    this.prevCard.classList.add('sl-p__slide-item_prev');
                break;
                case 1:
                    this.activeCard = el;
                    this.activeCard.classList.add('sl-p__slide-item_active');
                break;
                case 2:
                    this.nextCard = el;
                    this.nextCard.classList.add('sl-p__slide-item_next');
            }

            this.cardDecoR.before(el);

        })

        // заполняем переменные актуальной информацией
        this.itemsList = this.el.querySelector('.sl-p__slides-list');
        this.items = this.el.querySelectorAll('.sl-p__slide-item');

        this.cards = this.el.querySelectorAll('.sl-p__card');

        if(innerWidth > 1200) {
            this.cards.forEach((item, index) => {
                // Добавляем анимацию активным карточкам внутри item
                if(index < 3) {
                    this.setTransitionCard(item);
                }
            })
        }

        
        
        // показываем стрелки
        this.arrows.forEach(item => {
            item.style.display = 'block';
        });

        // находим список размеров и определяем активный
        this.findActiveSize();

        // определяем активный внутренний слайдер
        this.findActiveCardSlider();

        /**
         * Сдвигаем слайды на стартовое значение
         * чтобы боковые были видны только частично
        **/ 
        if(innerWidth <= 1200) {
            // ---------========  Внешний слайдер
            this.gap = parseFloat(getComputedStyle(this.itemsList).gap);

            const sumGap = this.gap * 2;
            
            this.widthSlide = this.items[0].offsetWidth;
    
            this.initOffset = this.widthSlide - ((innerWidth - sumGap - this.widthSlide) / 2);
            this.initOffsetVW = this.initOffset / innerWidth * 100 * -1;

            this.itemsList.style.transform = `translateX(${this.initOffsetVW}vw)`;

            // Переводим значения во vw
            // this.gap = this.gap / innerWidth * 100;
            // this.widthSlide = this.widthSlide / innerWidth * 100;
            
            // Расчитываем размер смещения (при инициализации)
            // в мобильной версии браузер не масштабируется  
            this.sizeMobileOffset = this.widthSlide + this.gap + Math.abs(this.initOffset);

            // Удаляем ненужные (декоративные) элементы из DOM
            this.itemsList.children[0].remove();
            this.itemsList.children[this.itemsList.children.length - 1].remove();

            // -------------=========== Внутренний слайдер
            
            // ширина карточки внутреннего слайдера 
            this.widthCardSlide = this.activeCardSlidesList.children[0].offsetWidth;
        }
    }

    // !!!!! ****  ДЕРГАЕТСЯ В МОБИЛКЕ ЕСЛИ КЛИК ПРОИЗОШЕЛ ДО ОКОНЧАНИЯ АНИМАЦИИ

    next() {
        if(this.stoped) return;
        this.stoped = true;

        // МОБИЛЬНАЯ ВЕРСИЯ
        if(innerWidth <= 1200) {
            
            this.itemsList.style.transition = `transform ${this.durationMobile}s ${this.timeF}`;

            this.itemsList.style.transform = `translateX(${this.sizeMobileOffset * -1}px)`;

            setTimeout(() => {                
                    this.itemsList.style.transition = ``;
    
                    const firstEl = this.itemsList.children[0];
                    this.itemsList.append(firstEl);
    
                    this.itemsList.style.transform = `translateX(${this.initOffsetVW}vw)`;
    
                    /** DOM меняется в мобильной версии **/ 
                    this.changeActiveClassMob();
    
                    // сбрасываем слайдер в карточке на ноль
                    this.mooveCardSlider(0);
    
                    // переопределяем активный блок с размерами
                    this.findActiveSize();
                    // переопределяем активный внутренний слайдер
                    this.findActiveCardSlider();
                    
                    this.stoped = false;
            }, this.durationMobile * 1000 + 50);
        }

        // ДЕСКТОПНАЯ ВЕРСИЯ
        if(innerWidth > 1200) {
            // находим следующий элемент определяем его положение
            // добавляем анимацию и перемещаем
            const nextEl = this.nextCard.nextElementSibling;
            nextEl.classList.add('sl-p__slide-item_next-r');
            setTimeout(() => {
                this.setTransitionCard(nextEl.firstElementChild);
                nextEl.classList.remove('sl-p__slide-item_next-r');
                nextEl.classList.add('sl-p__slide-item_next');
            })

            /**
             *  Вместе со сменой классов, меняется положение карточек, так как
             * карточки абсолбтно спозиционированы
             * DOM при этом не меняется
             *  **/ 
            // смещаем (меняем) next в актив
            this.nextCard.classList.remove('sl-p__slide-item_next');
            this.nextCard.classList.add('sl-p__slide-item_active');

            // смещаем (меняем) active в prev
            this.activeCard.classList.remove('sl-p__slide-item_active');
            this.activeCard.classList.add('sl-p__slide-item_prev');

            // смещаем (меняем) prev в prev-l
            this.prevCard.classList.remove('sl-p__slide-item_prev');
            this.prevCard.classList.add('sl-p__slide-item_prev-l');

            // сбрасываем слайдер в карточке на ноль
            this.mooveCardSlider(0);

            nextEl.addEventListener('transitionend', () => {
                this.prevCard.classList.remove('sl-p__slide-item_prev-l');
                this.prevCard.firstElementChild.style.transition = '';
                this.cardDecoR.before(this.prevCard);

                this.prevCard = this.activeCard;
                this.activeCard = this.nextCard;
                this.nextCard = nextEl;

                // переопределяем активный блок с размерами
                this.findActiveSize();
                // переопределяем активный внутренний слайдер
                this.findActiveCardSlider();

                this.stoped = false;
            }, {once: true})
        }
    }

    prev() {
        if(this.stoped) return;
        this.stoped = true;

        // МОБИЛЬНАЯ ВЕРСИЯ
        if(innerWidth <= 1200) {
            /**
             * так как небольшая часть карточки видна, сначала переставляем
             * крайнюю с конца карточку в начало
             * **/ 
            const lastEl = this.itemsList.children[this.itemsList.children.length - 1];
            this.itemsList.prepend(lastEl);

            this.itemsList.style.transform = `translateX(${this.sizeMobileOffset * -1}px)`;

            setTimeout(() => {
                this.itemsList.style.transition = `transform ${this.durationMobile}s ${this.timeF}`;
                this.itemsList.style.transform = `translateX(${this.initOffsetVW}vw)`;
            }, 10)

            setTimeout(() => {
                this.itemsList.style.transition = ``;

                /** DOM меняется в мобильной версии **/ 
                this.changeActiveClassMob();

                // сбрасываем слайдер в карточке на ноль
                this.mooveCardSlider(0);

                // переопределяем активный блок с размерами
                this.findActiveSize();
                // переопределяем активный внутренний слайдер
                this.findActiveCardSlider();
                
                this.stoped = false;
            }, this.durationMobile * 1000 + 50);
        }

        // ДЕСКТОПНАЯ ВЕРСИЯ
        if(innerWidth > 1200) {
            const prevEl = this.cardDecoR.previousElementSibling;
            this.cardDecoL.after(prevEl);
            prevEl.classList.add('sl-p__slide-item_prev-l');
            setTimeout(() => {
                this.setTransitionCard(prevEl.firstElementChild);
                prevEl.classList.remove('sl-p__slide-item_prev-l');
                prevEl.classList.add('sl-p__slide-item_prev');
            })

            // смещаем prev на active
            this.prevCard.classList.remove('sl-p__slide-item_prev');
            this.prevCard.classList.add('sl-p__slide-item_active');

            // смещаем active в prev
            this.activeCard.classList.remove('sl-p__slide-item_active');
            this.activeCard.classList.add('sl-p__slide-item_next');

            // смещаем next в активе
            this.nextCard.classList.remove('sl-p__slide-item_next');
            this.nextCard.classList.add('sl-p__slide-item_next-r');

            // сбрасываем слайдер в карточке на ноль
            this.mooveCardSlider(0);

            prevEl.addEventListener('transitionend', () => {
                this.nextCard.classList.remove('sl-p__slide-item_next-r');
                this.nextCard.firstElementChild.style.transition = '';
        
                this.nextCard = this.activeCard;
                this.activeCard = this.prevCard;
                this.prevCard = prevEl;

                // переопределяем активный блок с размерами
                this.findActiveSize();
                // переопределяем активный внутренний слайдер
                this.findActiveCardSlider();
                
                this.stoped = false;
            }, {once: true})
        }
    }

    touchStart(data) {
        this.swipeStart = data;

        /**
         * текущее значение на старте (будет нужно если движение)
         * будет только next (если prev то значение будет переопределено) 
         * **/ 
        this.currentOffset = this.itemsList.getBoundingClientRect().x;

        this.startTimeStamp = new Date().getTime();
    }

    swipe(p) {
        this.touchMoved = this.swipeStart - p;

        if(Math.abs(this.touchMoved) < 3) return;

        // свайп в prev с необходимость перестановки слайда в начало
        // для того чтоб слайд подставился только один раз при движении prev
        if(!this.relocated && this.touchMoved < 0) {

            const el = this.itemsList.children[this.itemsList.children.length - 1];
            this.itemsList.prepend(el);

            this.itemsList.style.transform = `translateX(${this.sizeMobileOffset * -1}px)`;

            // так как был переставлен элемент обновляем значение
            this.currentOffset = this.itemsList.getBoundingClientRect().x;

            this.relocated = true;

        }

        // расчет от первоначального положения минус насколько сдвинули
        this.itemsList.style.transform = `
            translateX(${this.currentOffset - this.touchMoved}px)
        `;
    }

    touchEnd(data) {
        if(Math.abs(this.touchMoved) < 3) return;

        // блокируем накликивание
        if(this.stoped) return;
        this.stoped = true;

        // сколько времени прошло между start и end
        const timeDifference = new Date().getTime() - this.startTimeStamp;

        // осталось до полной прокрутки
        const r = this.sizeMobileOffset - this.touchMoved;

        // Вычисляем за какое время во время касания сдвигался один пиксель 
        // и умножаем это значение на количество оставшихся для сдвига пикселей
        const durationOnePx = timeDifference / Math.abs(this.touchMoved);    
        let durationRemained = (durationOnePx * r) / 1000;
        durationRemained = durationRemained > 0.3 ? 0.3 : durationRemained;

        // Установка анимаций 
        this.itemsList.style.transition = `
            transform ${durationRemained}s ${this.timeF}
        `;
        

        //  ====== ----  если слайд был смещен не на много
        if(Math.abs(this.touchMoved) <= this.widthSlide / 3.5) {

            // смещение устанавливаем в зависимости подставлен слайд в начало или нет
            const offset = this.relocated ? this.sizeMobileOffset * -1 : this.initOffset * -1;
            this.itemsList.style.transform = `
                    translateX(${offset}px)
                `;
            
            this.itemsList.addEventListener('transitionend', () => {
                this.itemsList.style.transition = '';

                // если уже был подставлен элемент в начало
                if(this.relocated) {
                    this.itemsList.append(this.itemsList.children[0]);
                    this.itemsList.style.transform = `translateX(${this.initOffset * -1}px)`;
                    this.relocated = false;
                }

                this.touchMoved = null;
                this.stoped = false;
            }, {once: true})

            return;
        }


        //  ====== ----  swipe to next
        if(this.swipeStart > data) {  

            this.itemsList.style.transform = `translateX(${this.sizeMobileOffset * -1}px)`;

            this.itemsList.addEventListener('transitionend', () => {
                this.itemsList.style.transition = ``;

                this.itemsList.append(this.itemsList.children[0]);
                // если в процессе свайпа, сначала был свайп в prev
                // и только потом в next и был добавлен элемент в начало
                if(this.relocated) {
                    this.itemsList.append(this.slides.children[0]);
                    this.relocated = false;
                }

                this.itemsList.style.transform = `translateX(${this.initOffset * -1}px)`; 

                // переставляем классы prev active next
                this.changeActiveClassMob();

                // сбрасываем слайдер в карточке на ноль
                this.mooveCardSlider(0);

                // переопределяем активный блок с размерами
                this.findActiveSize();
                // переопределяем активный внутренний слайдер
                this.findActiveCardSlider();
                
                this.touchMoved = null;
                this.stoped = false;

            }, {once: true})
        }

        //  ====== ----  swipe to prev
        if(this.swipeStart < data) {          
            this.itemsList.style.transform = `translateX(${this.initOffset * -1}px)`;

            this.itemsList.addEventListener('transitionend', () => {
                this.itemsList.style.transition = ``;
                // если в процессе свайпа, сначала был свайп в prev и был добавлен элемент в начало
                if(this.relocated) {
                    this.relocated = false;
                }

                // переставляем классы prev active next
                this.changeActiveClassMob();

                // сбрасываем слайдер в карточке на ноль
                this.mooveCardSlider(0);

                // переопределяем активный блок с размерами
                this.findActiveSize();
                // переопределяем активный внутренний слайдер
                this.findActiveCardSlider();
                
                this.touchMoved = null;
                this.stoped = false;

            }, {once: true})
        }
    }


    // START Свайп для слайдера внутри большого слайда
    /**
     * Здесь немного ДРУГОЙ ПРИНЦИП РАБОТЫ 
     * Элемент переставляется на стадии свайпа до touchend
     * это на случай если 2 слайда, в touchend просто будем offset
     * возвращать на нулевое положение
     * **/ 

    touchInSideCardStart(data, activeItem) {
        if(this.activeCardSlidesList.children.length <= 1) return;
        this.swipeCardStart = data;

        /**
         * текущее значение на старте (будет нужно если движение)
         * будет только next (если prev то значение будет переопределено в inSideCardSwipe) 
         * **/ 
        this.currentCardOffset = 0;

        this.startTimeStampCard = new Date().getTime();

        this.activeCardSlidesList.style.transition = ``;

        // определяем карточку на которой произошло касание
        this.activeSwipeCardItem = activeItem;
    }

    
    inSideCardSwipe(p) {
        if(this.activeCardSlidesList.children.length <= 1) return;

        this.touchMovedCard = this.swipeCardStart - p;

        if(Math.abs(this.touchMovedCard) < 3) return;

        // если был prev элемент подставился, а потом вернулись к next
        // вкрнуть подставленый элемент обратно
        if(this.touchMovedCard <= 3 && this.touchMovedCard >= -3) {
            if(this.activeSwipeCardItem.previousElementSibling) {
                const el = this.activeCardSlidesList.children[0];
                this.activeCardSlidesList.append(el);

                this.currentCardOffset = 0;
                this.activeCardSlidesList.style.transform = `translateX(${this.currentCardOffset}px)`;
                
                // в стартовое положение
                this.relocatedCard = false;
            }
        }

        // свайп в prev с необходимость перестановки слайда в начало
        // для того чтоб слайд подставился только один раз при движении prev
        if((!this.relocatedCard) && this.touchMovedCard < -3) {
            const relocateElIndex = this.activeCardSlidesList.children.length - 1
            const el = this.activeCardSlidesList.children[relocateElIndex];
            this.activeCardSlidesList.prepend(el);

            // так как был переставлен элемент обновляем значение
            this.currentCardOffset = this.widthCardSlide * -1;
            this.activeCardSlidesList.style.transform = `translateX(${this.currentCardOffset}px)`;

            this.relocatedCard = true;
        }
  

        // расчет от первоначального положения минус насколько сдвинули
        this.activeCardSlidesList.style.transform = `
            translateX(${this.currentCardOffset - this.touchMovedCard}px)
        `;
    }

    touchInSideCardEnd(data) {
        if(this.activeCardSlidesList.children.length <= 1) return;

        if(this.stoped) return;
        this.stoped = true;

        // сколько времени прошло между start и end
        const timeDifference = new Date().getTime() - this.startTimeStampCard;

        // осталось до полной прокрутки
        const r = this.widthCardSlide - this.touchMovedCard;

        // Вычисляем за какое время во время касания сдвигался один пиксель 
        // и умножаем это значение на количество оставшихся для сдвига пикселей
        const durationOnePx = timeDifference / Math.abs(this.touchMovedCard);    
        let durationRemained = (durationOnePx * r) / 1000;
        durationRemained = durationRemained > 0.3 ? 0.3 : durationRemained;

        // Установка анимаций// ${durationRemained}
        this.activeCardSlidesList.style.transition = `
            transform ${durationRemained}s ${this.timeF} 
        `;


        //  ====== ----  если слайд был смещен не на много
        if(Math.abs(this.touchMovedCard) <= this.widthCardSlide / 3.5) {
            // смещение устанавливаем в зависимости подставлен слайд в начало или нет
            this.activeCardSlidesList.style.transform = `
                translateX(${this.currentCardOffset}px)
            `;
            
            this.activeCardSlidesList.addEventListener('transitionend', () => {
                // если в конце анимации подставлен элемент в начало
                if(Math.abs(this.currentCardOffset) > 0) {
                    this.activeCardSlidesList.style.transition = ``;

                    const firstEl = this.activeCardSlidesList.children[0];
                    this.activeCardSlidesList.append(firstEl);

                    this.activeCardSlidesList.style.transform = ``;

                    this.relocatedCard = false;
                }

                // Возвращаем transition в стартовое состояние
                setTimeout(() => {
                    this.activeCardSlidesList.style.transition = `
                        transform ${this.durationMobile}s ${this.timeF} 
                    `;
                })

                this.touchMovedCard = null;
                this.stoped = false;
            }, {once: true})

            // Если движения слайда не было то transitionend не сработает
            // поэтому устанавливаем this.stoped = false здесь
            if(this.touchMovedCard === null) {
                this.stoped = false;
            }

            // чтоб облегчить работу компилятору и он дальше не смотрел
            return;
        }



        //  ====== ----   to next
        if(this.swipeCardStart > data) {  

            const value = `translateX(${this.widthCardSlide * -1}px)`;
            this.activeCardSlidesList.style.transform = value;

            this.activeCardSlidesList.addEventListener('transitionend', () => {
                this.activeCardSlidesList.style.transition = ``;

                const el = this.activeCardSlidesList.children[0];
                this.activeCardSlidesList.append(el);

                this.activeCardSlidesList.style.transform = ``;

                const activeslide = this.activeCardSlidesList.children[0];
                this.changeActivePagination(activeslide.dataset.num);
                
                this.touchMovedCard = null;
                this.stoped = false;

                // Возвращаем transition в стартовое состояние
                setTimeout(() => {
                    this.activeCardSlidesList.style.transition = `
                        transform ${this.durationMobile}s ${this.timeF} 
                    `;
                })
            }, {once: true})
        }

        //  ====== ----   to prev
        if(this.swipeCardStart < data) {          
            this.activeCardSlidesList.style.transform = ``;

            this.activeCardSlidesList.addEventListener('transitionend', () => {

                const activeslide = this.activeCardSlidesList.children[0];
                this.changeActivePagination(activeslide.dataset.num);

                this.relocatedCard = false;
                this.stoped = false;
                this.touchMovedCard = null;

                // Возвращаем transition в стартовое состояние
                setTimeout(() => {
                    this.activeCardSlidesList.style.transition = `
                        transform ${this.durationMobile}s ${this.timeF} 
                    `;
                })
            }, {once: true})
        }
    }

    // END Свайп для слайдера внутри большого слайда



    /**
     * Двигает слайды во внутреннем слайдере
     * **/ 
    mooveCardSlider(index) {
            const widthSlide = this.activeCardSlidesList.children[0].offsetWidth;
            this.activeCardSlidesList.style.transform = `
                translateX(-${(widthSlide / innerWidth * 100) * index}vw)
            `;

        this.changeActivePagination(index);
    }

    changeActivePagination(index) {
        const lastActivePag = this.activePaginationList.querySelector('.sl-p__card-slider-pag-item_active');
        lastActivePag.classList.remove('sl-p__card-slider-pag-item_active');
        const newActivePag = this.activePaginationList.querySelector(`[data-num="${index}"]`);
        newActivePag.classList.add('sl-p__card-slider-pag-item_active');
    }

    /**
     * выбор цвета мерсча или акса
     * **/ 
    changeColor(id, color, article) {
        // меняем активный кружок
        const lastActivePag = this.activeColorPag.querySelector('.sl-p__card-slider-color-item_active');
        lastActivePag.classList.remove('sl-p__card-slider-color-item_active');
        const newActivePag = this.activeColorPag.querySelector(`#${id}`);
        
        newActivePag.classList.add('sl-p__card-slider-color-item_active');

        // меняем цвет мерча
        const images = this.activeCardSlidesList.querySelectorAll('img');
        const data = this.data.find(item => item.article === article);

        // картинка исчезает
        this.activeCardSlidesList.style.opacity = '0';

        // убираем transform чтоб возврат к первому слайду
        // произошел без анимации
        this.activeCardSlidesList.style.transition = '';

        // когда картинка исчезла сдвигаем слайдер в начало
        if(innerWidth > 1200) {
            this.mooveCardSlider(0);
        } else {
            this.changeActivePagination(0);
        }
        
        // показываем картинку
        this.activeCardSlidesList.style.opacity = '1';
        // подменяем картинки и переставляем индексы (индексы для пагинации)
        [...images].forEach( (item, i) => {
            item.src = `${data[color].img[i]}`;

            item.parentElement.dataset.num = i;
            /**
             * таким образом мы не переставляем сами li, но меняем в них картинки и num
             * и получается что слайдер стоит на старте, как будто только что создан
             * **/
        })
        // возвращаем всю анимацию
        setTimeout(() => {
            this.activeCardSlidesList.style.transition = `
                transform ${this.duration}s ${this.timeF}
            `;
        })
    }


    /**
     * выбор размера
     * **/ 
    choosingSize(el) {
        this.activeSize.classList.remove('sl-p__size-item_active');
        this.activeSize = el;
        this.activeSize.classList.add('sl-p__size-item_active');
    }

    /**
     * Создание одного элемента
     * **/ 
    createEl(el, className) {
        const element = document.createElement(el);
        className ? element.classList.add(className) : '';
        return element;
    }

    /**
     * Присвоение transition переданному элементу
     * transform, height, width, box-shadow
     * **/
    setTransitionCard(el) {
        el.style.transition = `
        transform ${this.duration}s ${this.timeF},
        height ${this.duration}s ${this.timeF},
        width ${this.duration}s ${this.timeF},
        box-shadow ${this.duration}s ${this.timeF}`;
    }

    /**
     * Определяет блок выбора размера, который сейчас активен
     * **/ 
    findActiveSize() {
        this.activeSize = this.el
        .querySelector('.sl-p__slide-item_active .sl-p__size-item_active');
    }

    /**
     * определяем активный ВНУТРЕННИЙ слайдер и его элементы
     * **/ 
    findActiveCardSlider() {
        this.activeCardSlider = this.activeCard.querySelector('.sl-p__card-wr-slider');
        this.activeCardSlidesList = this.activeCardSlider.querySelector('.sl-p__card-slides-list');;
        this.activePaginationList = this.activeCardSlider.querySelector('.sl-p__card-slider-pag-list');
        this.activeColorPag = this.activeCardSlider.querySelector('.sl-p__card-slider-color-list');
    }

    /**
     * Переопределяет классы prev active next для элементов в мобильной версии
     * **/ 
    changeActiveClassMob() {
        /** DOM меняется в мобильной версии **/ 
        // смещаем (меняем) prev в prev-l
        this.prevCard.classList.remove('sl-p__slide-item_prev');
        this.prevCard = this.itemsList.children[0];
        this.prevCard.classList.add('sl-p__slide-item_prev');

        // смещаем (меняем) active в prev
        this.activeCard.classList.remove('sl-p__slide-item_active');
        this.activeCard = this.itemsList.children[1];
        this.activeCard.classList.add('sl-p__slide-item_active');

        // смещаем (меняем) next в актив
        this.nextCard.classList.remove('sl-p__slide-item_next');
        this.nextCard = this.itemsList.children[2];
        this.nextCard.classList.add('sl-p__slide-item_next');
    }

    /**
     * Создает карточки
     * **/ 
    patternCard(data) {
        const item = this.createEl('li', 'sl-p__slide-item');

        const card  = this.createEl('div', 'sl-p__card');

        const price  = this.createEl('div', 'sl-p__card-price');
        price.style.transition = `opacity ${this.duration}s ${this.timeF}`;
        price.textContent = data.price;

        const currency  = this.createEl('span', '');
        // currency.textContent = 'p.';
        price.append(currency);

        // слайдер внутри карточки
        const wrInSlider  = this.createEl('div', 'sl-p__card-wr-slider');
        if(innerWidth > 1200) {
            wrInSlider.style = `
            transition: width ${this.duration}s ${this.timeF},
                height ${this.duration}s ${this.timeF}
            `;
        }

        const wrInSliderList  = this.createEl('div', 'sl-p__card-wr-slides');

        const inSliderList  = this.createEl('ul', 'sl-p__card-slides-list');
        inSliderList.style.transition = `
            transform ${this.duration}s ${this.timeF}
        `;
        inSliderList.style.width = `${data.black.img.length * 100}%`; 
        data.black.img.forEach((item, index) => {
            const inSliderItem  = this.createEl('li', 'sl-p__card-slides-item');
            inSliderItem.dataset.num = index;
            const inSliderImg  = this.createEl('img', 'sl-p__card-slides-img');
            inSliderImg.src = item;

            inSliderItem.append(inSliderImg);
            inSliderList.append(inSliderItem);
        }); 

        const inSliderPaginationList  = this.createEl('ul', 'sl-p__card-slider-pag-list'); 
        for(let i = 0; i < data.black.img.length; i += 1) {
            const inSliderPaginationItem  = this.createEl('li', 'sl-p__card-slider-pag-item');
            inSliderPaginationItem.dataset.num = i;
            if(i === 0) 
                inSliderPaginationItem.classList.add('sl-p__card-slider-pag-item_active');
            inSliderPaginationList.append(inSliderPaginationItem);
        }
        if(inSliderPaginationList.children.length <= 1) {
            inSliderPaginationList.style.visibility = 'hidden';
        }

        const colorList  = this.createEl('ul', 'sl-p__card-slider-color-list');
        colorList.dataset.article = data.article;
        data.colors.forEach((item, index) => {
            const colorItem  = this.createEl('li', 'sl-p__card-slider-color-item');
            colorItem.id = `color_${index}`; // для поиска и смены цвета кружочка
            colorItem.dataset.color_id = index;
            colorItem.dataset.color = item.name;
            if(index === 0) 
                colorItem.classList.add('sl-p__card-slider-color-item_active');
            colorItem.style.borderColor = `${item.value}`;
            const colorItemInSideCircle  = this.createEl('div', 'sl-p__card-slider-color-circle');
            colorItemInSideCircle.style = `background: ${item.value};`;

            colorItem.append(colorItemInSideCircle);
            colorList.append(colorItem);
        })
        
        wrInSliderList.append(inSliderList);
        wrInSlider.append(wrInSliderList);
        wrInSlider.append(inSliderPaginationList);
        wrInSlider.append(colorList);
        // -- слайдер внутри карточки

        const cardTitle  = this.createEl('div', 'sl-p__card-title');
        cardTitle.textContent = data.title;

        // все что находится под слайдером внутри карточки и исчезает
        const wrCardContent  = this.createEl('div', 'sl-p__card-wr-content');
        const cardContent  = this.createEl('div', 'sl-p__card-content');
        const sizeList  = this.createEl('ul', 'sl-p__size-list');
        data.black.sizes.forEach((item, index, arr) => {
            const sizeItem  = this.createEl('li', 'sl-p__size-item');
            
            if(index === 0) sizeItem.classList.add('sl-p__size-item_active');

            const sizeItemNum  = this.createEl('div', 'sl-p__size-item-num');
            sizeItemNum.textContent = item;

            sizeItem.append(sizeItemNum);
            sizeList.append(sizeItem);
        })

        const composition  = this.createEl('p', '');

        data.composition.forEach( item => {
            const compositionItem  = this.createEl('span', '');
            compositionItem.textContent = item;
            composition.append(compositionItem);
        } )
        
        const wrLink  = this.createEl('div', 'sl-p__card-wr-link');
        if(data.composition.length > 1 && innerWidth > 1200) 
            wrLink.style.marginTop = '0.5vw';
        else if(data.composition.length > 1 && innerWidth <= 1200)
            wrLink.style.marginTop = '2.94vw';

        const link  = this.createEl('a', 'sl-p__card-link');
        link.textContent = 'Купить'
        link.href = data.link;
        link.title = data.title;
        link.target = '_blank';
        link.dataset.article = data.article;
        // link.dataset.color = data.article.colors.name;
        wrLink.append(link);

        cardContent.append(sizeList);
        cardContent.append(composition);
        cardContent.append(wrLink);
        wrCardContent.append(cardContent);
        // -- все что находится под слайдером внутри карточки и исчезает

        const mask  = this.createEl('div', 'sl-p__card-mask');

        
        card.append(wrInSlider);
        card.append(mask);
        card.append(price); 
        card.append(cardTitle);
        card.append(wrCardContent);
        item.append(card)

        return item;
    }


    scrollToContacts() {
        const el = document.querySelector('.contacts');

        el.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest"
        })
    }
}
