export default class RedrawSlСoffee {
    constructor(slider, data) {
        this.slider = slider;
        this.data = data;

        this.description = this.slider.querySelector('.sl-prod__text-about');
        this.wrSlides = this.slider.querySelector('.sl-prod__wr-slides');
        this.slides = this.slider.querySelector('.sl-prod__slides');
        this.wrBigImg = this.slider.querySelector('.sl-prod__wr-big-img');
        this.bigImg = this.wrBigImg.querySelector('img');
        this.bigDescriptions = this.slider.querySelectorAll('.sl-prod__big-desc-card');

        this.amountSlides = null;

        this.filter = null;
        this.activePack = null;

        // количество видимых слайдов десктоп
        this.amountShowDesc = 3;

        this.timeFunc = 'ease-out';
        this.duration = 0.7; 
        this.durationChangeTextInfo = this.duration;
        this.durationHalf = this.duration / 2;

        this.oldActiveSlide = null;
        this.activeSlide = null;

        this.swipeStart = null;
        this.touchMoved = null;
        this.relocated = false; // для смещения в prev, чтоб перетавить слайд один раз
        this.currentOffset = null; // текущее смещение всего слайдера
        this.startTimeStamp = null;
        this.endTimeStamp = null;
        
        this.sizeOffset = null; // px

        this.activeBigDesc = null;

        this.block = false;
    }

    initSlider() { 
        // формируем слайды
        this.data.forEach((item, index) => {
            const el = this.createSlide(
                item.id,
                item?.part ? item.part : null,
                item.img,
                item.title,
                item.packing,
                item.link, 
                item.title,
                );

            el.style.transition = `height ${this.duration}s ${this.timeFunc}, width ${this.duration}s ${this.timeFunc}`;

            if(index === 0 && innerWidth > 1200) {
                el.classList.add('sl-prod__slide_active');

                this.bigImg.src = item.img;
                this.bigImg.classList.add(`sl-prod__big-img_${item.packing}`);
                this.bigImg.alt = item.title;
            }

            this.slides.append(el);
        });

        // Изначально слайды не видимы, показываем их
        this.slides.classList.add('sl-prod__slides_visible');

        // Запоминаем активный слайд
        this.activeSlide = this.slides.children[0];

        this.amountSlides = this.slides.children.length;

        // задаем ширину контейнеру со слайдами во vw для десктоп
        // в % для мобилки
        this.setWidthSliderContainer(this.slides, this.wrSlides);

        // Заполняем информацию о продукте
        this.fillTextInfo();

        // Определяем анимацию для большой картинки
        this.bigImg.style.transition = `opacity ${this.duration}s ${this.timeFunc}`;

        // Определяем анимацию для блока с текстом, описанием товара
        this.description.style.transition = `opacity ${this.durationHalf}s ${this.timeFunc}`;

        // Определяем анимацию для блока со слайдами, описанием товара
        this.slides.style.transition = `opacity ${this.duration}s ${this.timeFunc}`;

        // Определяем анимацию для нижнего блока с большим описанием
        if(innerWidth > 1200) {
            [...this.bigDescriptions].forEach(item => {
                item.style.transition = `opacity ${this.duration}s ${this.timeFunc}`;
            })
        }

        
        // Активируем актуальную карточку с большим описанием
        this.activeBigDesc = [...this.bigDescriptions].find(item => item.dataset.part === this.activeSlide.dataset.part);
        this.activeBigDesc.classList.add('sl-prod__big-desc-card_active');
    }

    moveNext() {
        // блокируем накликивание
        if(this.block) return;
        this.block = true;

        // для десктопа
        if(innerWidth > 1200) {
            // клонируем и подставляем первый слайд назад
            const clone = this.activeSlide.cloneNode(true);
            clone.classList.remove('sl-prod__slide_active');
            this.slides.append(clone);

            // устанавливаем анимацию
            this.slides.style.transition = `transform ${this.duration}s ${this.timeFunc}`;

            this.oldActiveSlide = this.activeSlide;
            this.activeSlide = this.slides.children[1];
            this.activeSlide.classList.add('sl-prod__slide_active');


            setTimeout(() => {
                // получаем ширину активного слайда vw и двигаем
                const width = this.oldActiveSlide.offsetWidth;
                const offset = (width + this.getGap()) / innerWidth * 100;
                this.slides.style.transform = `translateX(-${offset}vw)`;
            })

            this.slides.addEventListener('transitionend', () => {
                // убираем transform возвращаем opacity
                this.slides.style.transition = `opacity ${this.duration}s ${this.timeFunc}`;
                this.oldActiveSlide.remove();
                this.slides.style.transform = ``;
            }, {once: true});

            // меняем большую картинку и описания товара
            this.changeBigImg(this.activeSlide);
        }

        // Для мобилки
        if(innerWidth <= 1200) {
            const offset = this.slides.children[0].offsetWidth / innerWidth * 100;

            // устанавливаем анимацию
            this.slides.style.transition = `transform ${this.duration}s ${this.timeFunc}`;

            // Меняем активный слайд
            this.activeSlide = this.slides.children[1];

            setTimeout(() => {
                // Сдвигаем
                this.slides.style.transform = `translateX(-${offset}vw)`;
            })

            this.slides.addEventListener('transitionend', () => {
                this.slides.style.transition = `opacity ${this.duration}s ${this.timeFunc}`;
                this.slides.append(this.slides.children[0]);
                this.slides.style.transform = ``;
            }, {once: true});
        }

        // Меняем описание
        this.changeBigDescription(this.activeSlide);
        this.changeTextInfo(this.activeSlide, this.data);
        
    }

    movePrev() {
        // блокируем накликивание
        if(this.block) return;
        this.block = true; 

        // Для десктопа
        if(innerWidth > 1200) {
            // клонируем и подставляем первый слайд назад
            const el = this.slides.children[this.slides.children.length - 1];
            const clone = el.cloneNode(true);
            clone.classList.add('sl-prod__slide_active');
            this.slides.prepend(clone);

            // получаем ширину активного слайда vw и
            // ставим блок со слайдами в нужное стартовое положение
            const width = this.activeSlide.offsetWidth;
            const offset = (width + this.getGap()) / innerWidth * 100;
            this.slides.style.transform = `translateX(-${offset}vw)`;

            this.oldActiveSlide = this.activeSlide;
            this.activeSlide = this.slides.children[0];
            this.oldActiveSlide.classList.remove('sl-prod__slide_active');


            setTimeout(() => {
                // устанавливаем анимацию
                this.slides.style.transition = `transform ${this.duration}s ${this.timeFunc}`;
                // получаем ширину активного слайда vw и двигаем
                this.slides.style.transform = ``; //translateX(-${offset}vw)
            }, 5)

            this.slides.addEventListener('transitionend', () => {
                // убираем transform возвращаем opacity
                this.slides.style.transition = `opacity ${this.duration}s ${this.timeFunc}`;
                el.remove();
                // this.slides.style.transform = ``;
            }, {once: true});

            // меняем большую картинку и описания товара
            this.changeBigImg(this.activeSlide);
        }

        // Для мобилки
        if(innerWidth <= 1200) {
            // ставим последний слайд в начало
            const lastElement = this.slides.children[this.slides.children.length - 1];
            this.slides.prepend(lastElement);
            const offset = this.slides.children[0].offsetWidth / innerWidth * 100;

            this.slides.style.transform = `translateX(-${offset}vw)`;

            // Меняем активный слайд
            this.activeSlide = this.slides.children[0];

            setTimeout(() => {
                // сдвигаем
                this.slides.style.transition = `transform ${this.duration}s ${this.timeFunc}`;
                this.slides.style.transform = ``;
            }, 20)
            
            this.slides.addEventListener('transitionend', () => {
                this.slides.style.transition = `opacity ${this.duration}s ${this.timeFunc}`;
            }, {once: true});
        }

        // Меняем описание
        this.changeBigDescription(this.activeSlide);
        this.changeTextInfo(this.activeSlide, this.data);
    }

    // SWIPE START
    touchStart(data) {
        this.swipeStart = data;
        // Размер слайда или максимальная ширина сдвига 
        this.getWidthOffset();
        // Актуальный сдвиг
        this.currentOffset = this.slides.getBoundingClientRect().x;

        this.startTimeStamp = new Date().getTime();
    }

    swipe(p) {
        if(this.block) return;

        this.touchMoved = (this.swipeStart - p);

        if(Math.abs(this.touchMoved) < 3) return;

        // свайп в prev с необходимость перестановки слайда в начало
        // для того чтоб слайд подставился только один раз при движении prev
        if(!this.relocated && this.touchMoved < 0) {
            this.slides.prepend(this.slides.children[this.slides.children.length - 1]);
            this.slides.style.transform = `translateX(-${this.sizeOffset}px)`;
            this.currentOffset = this.slides.getBoundingClientRect().x;
            this.relocated = true;
        }

        this.slides.style.transform = `translateX(${this.currentOffset - this.touchMoved}px)`;
    }

    touchEnd(data) {
        // блокируем накликивание
        if(this.block) return;
        this.block = true;

        // сколько времени прошло между start и end
        const timeDifference = new Date().getTime() - this.startTimeStamp;

        // осталось до полной прокрутки
        const r = this.sizeOffset - this.touchMoved;

        // Вычисляем за какое время во время касания сдвигался один пиксель 
        // и умножаем это значение на количество оставшихся для сдвига пикселей
        const durationOnePx = timeDifference / Math.abs(this.touchMoved);    
        let durationRemained = (durationOnePx * r) / 1000;
        durationRemained = durationRemained > 0.3 ? 0.3 : durationRemained;

        // Установка анимаций
        this.slides.style.transition = `
            transform ${(durationRemained)}s ${this.timeFunc}
        `;
        // Корректируем время анимации смены текста описания под время свайпа слайда
        this.durationChangeTextInfo = durationRemained;


        //  ====== ----  если слайд был смещен не на много
        if(Math.abs(this.touchMoved) <= this.sizeOffset / 3.5) {

            // смещение устанавливаем в зависимости подставлен слайд в начало или нет
            const offset = this.relocated ? this.sizeOffset * -1 : 0;
                this.slides.style.transform = `
                    translateX(${offset}px)
                `;
            
            this.slides.addEventListener('transitionend', () => {
                this.slides.style.transition = `opacity ${this.duration}s ${this.timeFunc}`;

                // если уже был подставлен элемент в начало
                if(this.relocated) {
                    this.slides.append(this.slides.children[0]);
                    this.slides.style.transform = ``;
                    this.relocated = false;
                }

                this.block = false
            }, {once: true})

            return;
        }

        //  ====== ----   to next
        if(this.swipeStart > data) {  
            // Обновляем насколько сдвинут блок со слайдами
            this.currentOffset = this.slides.getBoundingClientRect().x;
            
            setTimeout(() => {
                this.slides.style.transform = `translateX(-${Math.abs(this.currentOffset) + r}px)`;
            },10)

            // принцип работы слайдера такой что при next следующий активный 
            // слайд, пока не произошла перестановка всегда под индексом 1
            this.activeSlide = this.slides.children[1];

            this.slides.addEventListener('transitionend', () => {
                this.slides.style.transition = `opacity ${this.duration}s ${this.timeFunc}`;
                this.slides.append(this.slides.children[0]);
                // если в процессе свайпа, сначала был свайп в prev и был добавлен элемент в начало
                if(this.relocated) {
                    this.slides.append(this.slides.children[0]);
                    this.relocated = false;
                }

                this.slides.style.transform = ``;
            }, {once: true})
        }

        //  ====== ----   to prev
        if(this.swipeStart < data) {          

            this.slides.style.transform = ``;

            this.activeSlide = this.slides.children[0];

            this.slides.addEventListener('transitionend', () => {
                this.slides.style.transition = `opacity ${this.duration}s ${this.timeFunc}`;
                // если в процессе свайпа, сначала был свайп в prev и был добавлен элемент в начало
                if(this.relocated) {
                    this.relocated = false;
                }
            }, {once: true})
        }

        // Меняем описание
        this.changeBigDescription(this.activeSlide);
        this.changeTextInfo(this.activeSlide, this.data);
    }

    // SWIPE END


    // Замена элементов при выборе фильтра
    renderingWithFilter(pack) {
        // если клик по тому же фильтру или фильтр не активен
        if(this.activePack === pack || (!this.activePack && pack === 'reset')) return;

        if(pack === 'reset') {
            this.filter = this.data;
            this.activePack = null;
        } else {
            this.filter = this.data.filter(item => item.packing === pack);
            this.activePack = pack;
        }

        const ul = this.createEl('ul', ['sl-prod__slides']);
        const left = parseFloat(getComputedStyle(this.wrSlides).paddingLeft);
        const top = parseFloat(getComputedStyle(this.wrSlides).paddingTop);
        ul.style.transition = `opacity ${this.duration}s ${this.timeFunc}`;
        ul.style.position = 'absolute';
        ul.style.top = `${top}px`;
        ul.style.left = `${left}px`;

        this.filter.forEach((item, index) => {
            
            const li = this.createSlide(
                item.id,
                item?.part ? item.part : null,
                item.img, 
                item.title, 
                item.packing, 
                item.link, 
                item.title,
            );
            li.style.transition = `height ${this.duration}s ${this.timeFunc}, width ${this.duration}s ${this.timeFunc}`;

            if(index === 0 && innerWidth > 1200) {
                li.classList.add('sl-prod__slide_active');
            }
            li.dataset.id = item.id;

            ul.append(li);
        });

        this.wrSlides.append(ul);

        this.changeBigImg(ul.children[0]);
        this.changeTextInfo(ul.children[0], this.filter);
        this.changeBigDescription(ul.children[0]);

        // для мобилки и десктопа разных подход к распределению ширин и элементов
        // ообязательный метод
        this.setWidthSliderContainer(ul, this.wrSlides)

        setTimeout(() => {
            this.slides.classList.remove('sl-prod__slides_visible');
            ul.classList.add('sl-prod__slides_visible');
        }, 10)
        
        this.slides.addEventListener('transitionend', () => {
            this.slides.remove();

            ul.style.position = '';
            ul.style.top = '';
            ul.style.left = '';

            this.slides = ul;

            // Запоминаем активный слайд
            this.activeSlide = this.slides.children[0];

            this.amountSlides = this.slides.children.length;
        })
    }

    changeBigImg(activeSlide) { 
        const newImage = activeSlide.children[0].children[0];

        // Определяем упаковку активного слайда
        const pack = newImage.dataset.pack

        // создаем новый элемент и создаем для него все необходимые параметры
        const img = this.createEl('img', ['sl-prod__big-img', `sl-prod__big-img_${pack}`]);

        img.style = `
            position: absolute;
            left: 0;
            transition: opacity ${this.duration}s ${this.timeFunc};
        `;

        img.src = newImage.src; // указываем src для нового элемента

        this.wrBigImg.prepend(img);

        setTimeout(() => {
            this.wrBigImg.children[0].classList.add('sl-prod__big-img_visible');
            this.bigImg.classList.remove('sl-prod__big-img_visible');
        });
        
        this.bigImg.addEventListener('transitionend', () => {
            this.bigImg.remove();

            this.bigImg = this.wrBigImg.children[0];

            this.bigImg.style.position = '';
            this.bigImg.style.left = '';    
        }, {once: true})
    }

    changeTextInfo(activeSlide, data) {
        const id = activeSlide.dataset.id;

        const info = data.find( item => item.id === id);
        const keys = Object.keys(info);
        keys.forEach( item => {
            const el = this.description.querySelector(`[data-type="${item}"]`);
            if(el) {
                const newEl = this.createEl(el.localName, [el.className]);
                newEl.dataset.type = el.dataset.type;
                newEl.textContent = info[item];

                newEl.style = `
                    position: absolute;
                    top: 0;
                    ${el.dataset.type !== 'title' &&
                    el.dataset.type !== 'taste' ? (
                        `
                        right: 0;`
                    ) : el.dataset.type === 'taste' ? (
                        `
                        text-indent: ${
                            el.parentElement.previousElementSibling.offsetWidth
                        }px;
                        left: 0;`
                    ) : (
                        ''
                    )}
                    opacity: 0;
                    transition:
                     opacity
                     ${this.durationChangeTextInfo}s
                     ${this.timeFunc}
                    ;
                `;

                el.style = `transition: opacity ${this.durationChangeTextInfo}s ${this.timeFunc};`;

                el.after(newEl);

                setTimeout(() => {
                    el.style.opacity = '0';
                    newEl.style.opacity = '1';
                }, 20)

                el.addEventListener('transitionend', () => {
                    el.remove();
                    newEl.style = 'opacity: 1;';

                    // Возвращаем сдантартное время смены текста (для клика)
                    this.durationChangeTextInfo = this.duration;

                    this.block = false;
                }, {once: true})
            }
        })
    }

    changeBigDescription(activeSlide) {
        const part = activeSlide.dataset?.part;
        
        if(part && part === this.activeBigDesc.dataset.part) return;

        // Активируем карточку
        const el = [...this.bigDescriptions].find(item => item.dataset.part === part);

        el.classList.add('sl-prod__big-desc-card_active');

        this.activeBigDesc.classList.remove('sl-prod__big-desc-card_active');

        setTimeout(() => {
            this.activeBigDesc = el;
        })
    }

    fillTextInfo() {
        const id = this.activeSlide.dataset.id;
        const info = this.data.find( item => item.id === id);
        const keys = Object.keys(info);
        keys.forEach( item => {
            const el = this.description.querySelector(`[data-type="${item}"]`);
            if(el) el.textContent = info[item]
        })
    } 

    // ширина обертки над слайдами (в которой слайды сдвигаются)
    setWidthSliderContainer(slides, wrSlides) {
        // для десктопа
        if(innerWidth > 1200) {
            // задаем ширину контейнеру со слайдами во vw
            let width = [...slides.children].reduce( (acc, item, index) => {
                return index < this.amountShowDesc ? 
                (
                    acc += item.offsetWidth / innerWidth * 100
                ) : 
                (
                    acc
                );
            }, 0);

            width += ((this.getGap() * this.amountShowDesc) / innerWidth * 100);
            wrSlides.style = `width: ${width.toFixed(3)}vw;`;
        }
        
        // для мобилки
        if(innerWidth <= 1200 ) {
            const widtsSlidesList = slides.children.length * 100;
            slides.style.width = `${widtsSlidesList}%`;
        }
    }

    createSlide(id, part, pathImg, title, packing, href, linkTitle) {
        // слайд
        const li = this.createEl('li', ['sl-prod__slide']);
        
        // изоюражение на слайде
        const divImg = this.createEl('div', ['sl-prod__wr-img-slide', `sl-prod__wr-img-slide_${packing}`]);
        const img = this.createEl('img', ['sl-prod__img-slide']);
        li.dataset.id = id;
        if(part) li.dataset.part = part // для дрип, к какому набору относится
        li.dataset.packing = packing;
        img.dataset.pack = packing;
        img.src = pathImg;

         
        divImg.append(img);

        li.append(divImg);

        // выбор типа кофе для фильтра(зерно или какой-то помол)
        if(packing === 'filter') {
            const arrText = ['Зерно', 'Эспрессо', 'Капельная кофеварка', 'Турка'];
            const arrTextEn = ['seed', 'espresso', 'drip', 'turk'];

            const radioForm = this.createEl('form', ['sl-prod__radio-form']);

            const radioList = this.createEl('ul', ['sl-prod__radio-list']);

            for(let i = 0; i < 4; i += 1) {
                const radioItem = this.createEl('li', ['sl-prod__radio-item']);

                const label = this.createEl('label', ['sl-prod__radio-label', `sl-prod__radio-label-${arrTextEn[i]}`]);

                const radioButton = this.createEl('input', ['sl-prod__radio-input']);
                radioButton.type = 'radio';
                radioButton.name = 'sl-prod-radio';
                radioButton.value = arrText[i];
                if(i === 0) radioButton.checked = true;

                const radioButtonCustomBack = this.createEl('span', ['sl-prod__radio-input-cust-back']);
                const radioButtonCustomBody = this.createEl('span', ['sl-prod__radio-input-cust-body']);
                radioButtonCustomBack.append(radioButtonCustomBody);

                const radioText = this.createEl('span', ['sl-prod__radio-text']);
                radioText.textContent = arrText[i];

                label.append(radioButton);
                label.append(radioButtonCustomBack);
                label.append(radioText);

                radioItem.append(label);

                radioList.append(radioItem)
            }

            radioForm.append(radioList);

            li.append(radioForm);
        }

        // заголовок слайда
        const divTitle = this.createEl('div', ['sl-prod__wr-title-slide']);
        const h3 = this.createEl('h3', ['sl-prod__title-slide']);
        h3.textContent = title;
        divTitle.append(h3);

        li.append(divTitle);

        if(packing !== 'drip') {
            // кнопка 
            const divButton = this.createEl('div', ['sl-prod__wr-button-slide']);
            const link = this.createEl('a', ['sl-prod__button-slide']);
            link.href = href;
            link.title = linkTitle;
            link.dataset.part
            link.textContent = 'Купить';
            const linkDeco = this.createEl('div', ['sl-prod__wr-button-slide-deco']);
            divButton.append(link);
            divButton.append(linkDeco);
    
            li.append(divButton);
        }

        return li;
    }

    createEl(el, arrClassName) {
        const element = document.createElement(el);

        arrClassName.forEach(c => element.classList.add(c));
        
        return element;
    }

    getWidthOffset() {
        this.sizeOffset = this.slides.children[0].offsetWidth;
    }

    getGap() {
        return parseFloat(getComputedStyle(this.slides).gap);
    }

    scrollToContacts() {
        const el = document.querySelector('.contacts');

        el.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest"
        })
    }

    scrollToDescription() {
        const el = this.bigDescriptions[0].parentElement;

        el.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest"
        })
    }
}