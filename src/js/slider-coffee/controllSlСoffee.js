export default class ControllSlСoffee {
    constructor(d, filter, addToBasket) {
        this.d = d;
        this.filter = filter;
        this.addToBasket = addToBasket;

        this.click = this.click.bind(this);
        this.touchMoove = this.touchMoove.bind(this);
        this.touchStart = this.touchStart.bind(this);
        this.touchEnd = this.touchEnd.bind(this);
    }

    init() {
        this.d.initSlider();
        this.registerEvents();

        // отрисовка кнопок фильтра 
        const data = new Map();
        this.d.data.forEach(item => data.set(item.packing, item['filter-name']));
        this.filter.rendering(data);
    }

    registerEvents() {
        this.d.slider.addEventListener('click', this.click);
        this.d.wrSlides.addEventListener('touchstart', this.touchStart, {passive: true});
        this.d.wrSlides.addEventListener('touchmove', this.touchMoove, {passive: true});
        this.d.wrSlides.addEventListener('touchend', this.touchEnd, {passive: true});
    }

    click(e) {
        // не блокируем поведение радио кнопок
        if(!e.target.closest('.sl-prod__radio-item')) {
            e.preventDefault();
        }

        if(e.target.closest('.slider__arrow-next')) {
            this.d.moveNext();
        }

        if(e.target.closest('.slider__arrow-prev')) {
            this.d.movePrev();
        }

        if(e.target.closest('.sl-prod__filter-type')) {
            this.filter.setActive(
                e.target.closest('.sl-prod__filter-type'),
                this.d.renderingWithFilter.bind(this.d)
            );
        }

        if(e.target.closest('.sl-prod__filter-reset')) {
            this.filter.resetActive(
                this.d.renderingWithFilter.bind(this.d)
            );
        }

        if(e.target.closest('.sl-prod__button-slide')) {
            // this.d.scrollToContacts();

            // article: "3"
            // color: ""
            // imgUrl: ['./img/content/accessories-nok-box-motta-105-content.webp']
            // price: "4 000 p."
            // sectionName: "accessories"
            // size: "105 мм"
            // title: "Нок-бокс"

            const card = e.target.closest('li');

            
            let choice = {
                article : card.dataset.id,
                part : card.dataset.part,
                packing : card.dataset.packing,
                imgUrl : '',
                sectionName : 'coffee',
                amount : 1,
            }

            // для фильтр кофе получаем значение радио кнопок (зерно/помол)
            const radioForm = card.querySelector('form');
            if(radioForm) {
                const radioButtons = radioForm['sl-prod-radio'];
                const valueButtonChecked = [...radioButtons].find(i => i.checked).value;
                choice.grinding = valueButtonChecked;
            }

            const coffee = this.d.data.find(item => {
                return (
                    item.id === choice.article && item.packing === card.dataset.packing
                );
            });
  
            // значение набор (того что получит в итоге покупатель)
            choice.part = coffee.part;
            choice.description = coffee.description;

            // если дрип пакет то подставляем путь к картинке набор 
            // если другой то картинка пачка кофе
            if(coffee?.img_part) {
                choice.imgUrl = coffee.img_part;
                choice.article = coffee.part;
                choice.title = coffee.part;
            } else {
                choice.imgUrl = coffee.img;
                choice.title = coffee.title;
            }

            this.addToBasket(choice);
        }

        if(e.target.closest('.sl-prod__wr-to-big-description')) {
            this.d.scrollToDescription();
        }
    }

    touchStart(e) {
        this.d.touchStart(e.changedTouches[0].clientX);
    }

    touchMoove(e) {
        this.d.swipe(e.changedTouches[0].clientX);
    }

    touchEnd(e) {
        this.d.touchEnd(e.changedTouches[0].clientX);
    }
} 