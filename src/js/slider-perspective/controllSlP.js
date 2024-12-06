export default class ControllSLP {
    constructor(d, addToBasket) {
        this.d = d;
        this.addToBasket = addToBasket;
 
        this.click = this.click.bind(this);
        this.touchMoove = this.touchMoove.bind(this);
        this.touchStart = this.touchStart.bind(this);
        this.touchEnd = this.touchEnd.bind(this);
    }

    init() {
        this.d.initSlider(); 
        this.registerEvents();
    }
 
    registerEvents() {
        this.d.el.addEventListener('click', this.click);

        this.d.itemsList.addEventListener('touchstart', this.touchStart, {passive: true});
        this.d.itemsList.addEventListener('touchmove', this.touchMoove, {passive: true});
        this.d.itemsList.addEventListener('touchend', this.touchEnd, {passive: true});
    }

    click(e) {
        e.preventDefault();

        if(e.target.closest('.slider__arrow-next')) {
            this.d.next();
        }

        if(e.target.closest('.slider__arrow-prev')) {
            this.d.prev();
        }

        if(e.target.closest('.sl-p__size-item')) {
            this.d.choosingSize(e.target.closest('.sl-p__size-item'));
        }

        if(e.target.closest('.sl-p__card-slider-pag-item')) {
            const el = e.target.closest('.sl-p__card-slider-pag-item');
            const index = +el.dataset.num;
            this.d.mooveCardSlider(index);
        }

        if(e.target.closest('.sl-p__card-slider-color-item')) {
            const list = e.target.closest('.sl-p__card-slider-color-list');
            const article = list.dataset.article
            const el = e.target.closest('.sl-p__card-slider-color-item');
            const id = el.id;
            const color = el.dataset.color;
            this.d.changeColor(id, color, article);
        }

        if(e.target.closest('.sl-p__card-link')) {
            // this.d.scrollToContacts();
            const button = e.target.closest('.sl-p__card-link');
            const section = button.closest('section');
            const card = e.target.closest('.sl-p__card');
            const el_color = card.querySelector('.sl-p__card-slider-color-item_active');
            const index_color = +el_color.dataset.color_id;
            const size = card.querySelector('.sl-p__size-item_active');

            let choice = {
                sectionName : section.className,
                article : button.dataset.article,
                color : el_color.dataset.color,
                size : size.children[0].textContent
            }

            const allDataChoice = this.d.data.find(item => choice.article === item.article);
            const imgUrl = 
                allDataChoice[choice.color]?.img[index_color] 
                || 
                allDataChoice.black.img[0];

            const data = {
                ...choice, 
                price : allDataChoice.price,
                imgUrl,
                title : allDataChoice.title,
                description : allDataChoice.description,
                amount : 1,
            };
    
            this.addToBasket(data);
        }
    }

    touchStart(e) {      
        // свайп внешнего слайда  
        if(!e.changedTouches[0].target.closest('.sl-p__card-wr-slider')) {
            this.d.touchStart(e.changedTouches[0].clientX);
        }
        // свайп внутреннего слайда
        if(e.changedTouches[0].target.closest('.sl-p__card-wr-slider') &&
        !e.changedTouches[0].target.closest('.sl-p__card-slider-pag-list')) {
            this.d.touchInSideCardStart(
                e.changedTouches[0].clientX,
                e.changedTouches[0].target.closest('.sl-p__card-slides-item')
                );
        }
    }

    touchMoove(e) {
        // свайп внешнего слайда 
        if(!e.changedTouches[0].target.closest('.sl-p__card-wr-slider')) {
            this.d.swipe(e.changedTouches[0].clientX);
        }
        // свайп внутреннего слайда
        if(e.changedTouches[0].target.closest('.sl-p__card-wr-slider') &&
        !e.changedTouches[0].target.closest('.sl-p__card-slider-pag-list')) {
            this.d.inSideCardSwipe(e.changedTouches[0].clientX);
        }        
    }

    touchEnd(e) {
        // свайп внешнего слайда 
        if(!e.changedTouches[0].target.closest('.sl-p__card-wr-slider')) {
            this.d.touchEnd(e.changedTouches[0].clientX);
        }  
        // свайп внутреннего слайда 
        if(e.changedTouches[0].target.closest('.sl-p__card-wr-slider') &&
        !e.changedTouches[0].target.closest('.sl-p__card-slider-pag-list')) {
            this.d.touchInSideCardEnd(e.changedTouches[0].clientX);
        }
    }
}