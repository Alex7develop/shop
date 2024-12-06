export default class RedrawBasketButton {
    constructor(el, mobileEl) {
        this.el = el;
        this.mobileEl = mobileEl;

        // количество товаров над иконкой
        this.amount = this.el.querySelector('.header__basket-amount');

        this.lastActiveModal = null;
    }

    page

    incorrectData(input, text) {
        if(input.type === 'password') input.type = 'text';

        input.value = text;
        input.style.color = '#FF7C7C';
        input.dataset.invalid = 1;

        // при фокусе на поле возвращаем стандартный вид
        // если были изменения при вводе не валидных данных
        input.addEventListener('focus', () => {
            input.style.color = '#fff';
            input.value = '';
            input.dataset.invalid = '';
            if(input.name === 'password') input.type = 'password';
        }, { once : true })
    }

    // подсвечиваем иконку при заходе на страницу корзина
    redrawIconBasket() {
        this.el.classList.add('header__basket_active'); 
    }

    // отображение общего количества товаров в корзине
    redrawIconAmount() {
        if(!localStorage?.basket) { 
            this.amount.classList.remove('header__basket_active');
            this.amount.textContent = 0;

            // if(this.el.classList.contains('header__basket_active')) {
            //     this.el.classList.remove('header__basket_active');
            // }
            return;
        }
        const basket = JSON.parse(localStorage.basket);
        
        const result = basket.reduce((acc, item) => {
            return acc += +item.amount
        }, 0);
    
        this.amount.textContent = result;
        // if(!this.el.classList.contains('header__basket_active')) {
        //     this.el.classList.add('header__basket_active');
        // }
    }



    // изменение количества товара в корзине визуально
    calcAmountGoods(button) {
        const type = button.dataset.type;

        let amount;
        let num;

        if(type === 'decrement') {
            amount = button.nextElementSibling; 

            num = +amount?.value;
            if(+amount.value === 0) return;
            amount.value = num - 1;
        }

        if(type === 'increment') {
            amount = button.previousElementSibling;

            num = +amount?.value;
            amount.value = num + 1;
        }
    }

    // открываем модалку
    openNewModal(modal) {
        if(this.lastActiveModal) this.lastActiveModal.remove();
        this.lastActiveModal = modal;

        if(this.lastActiveModal.classList.contains('wrapper-modal__basket')) {
            this.fillingBasket();
        }

        document.body.append(modal);
    }

    // наполнение модалки корзина товарами которые пользователь набрал
    fillingBasket() {
        if(!localStorage?.basket) {
            return;
        }

        const goodsList = this.lastActiveModal.querySelector('.modal-basket__goods-list');
    
        const basket = JSON.parse(localStorage.basket);

        const goods = basket.map((item, index) => {
            return this.patternProduct(item, index);
        });
   
        goodsList.append(...goods);
    }

    deleteProduct(index) {
        const product = this.lastActiveModal.querySelector(`[data-index="${index}"]`);
        product.remove();
    }

    closeModal() {
        this.lastActiveModal.remove();
        this.lastActiveModal = null;
    }

    patternProduct(data, index) {
        console.log(data)
        const li = this.createEl('li', ['modal-basket__goods-item'])
        li.dataset.index = index;
        li.dataset.sku_title = data.title;
        li.dataset.sku_packing = data.title;
        li.dataset.article = data.article;
        if(data?.grinding) li.dataset.grinding = data.grinding;

        // левая часть: картинка и описание
        const goods_content = this.createEl('div', ['modal-basket__goods-content']);

        const goods_img = this.createEl('div', ['modal-basket__goods-img']);
        
        const img = this.createEl('img', null, null, data.imgUrl);
        img.alt = 'Фото товара'

        goods_img.append(img);

        const description = this.createEl('div', ['modal-basket__goods-description']);
        
        const description_p = this.createEl('p', null, data.description);
        description.append(description_p);

        // определяем текст контента (если есть помол или зерно)
        let textGrinding = null;

        if(data.packing === "espresso") {
            switch(data.article) {
                case 'colombia-excelso-decaf-ground' :
                    textGrinding = 'Молотый'; 
                break;
                default : 
                    textGrinding = 'Зерно'; 
            }  
        } else if (data.packing === "filter") {  
            switch(data.grinding) {
                case 'Зерно' :
                    textGrinding = 'Зерно';
                break;
                default : 
                    textGrinding = `Молотый: ${data.grinding.toLowerCase()}`;
            }     
        } else if (data.packing === "drip") {
            textGrinding = `Молотый`;
        }
            
        const description_grinding = this.createEl('p', null, textGrinding);
        description.append(description_grinding);

        goods_content.append(goods_img);
        goods_content.append(description);

        // правая часть количество
        const goods_amount = this.createEl('div', ['modal-basket__goods-amount']);

        const decrement = this.createEl('div', ['modal-basket__goods-amount-button']);
        decrement.dataset.type = 'decrement';
        
        const amount_num = this.createEl('input', ['modal-basket__goods-amount-num']);
        amount_num.type = 'text';
        amount_num.placeholder = "0";
        amount_num.value = data.amount;

        const increment = this.createEl('div', ['modal-basket__goods-amount-button']);
        increment.dataset.type = 'increment';
        // .img/content/big-desc-part-of-africa-1-content.webp 
        goods_amount.append(decrement);
        goods_amount.append(amount_num);
        goods_amount.append(increment);

        // ---------------------------
        li.append(goods_content);
        li.append(goods_amount);

        return li;
    }

    createEl(tag, classes = null, content = null, url = null) {
        const el = document.createElement(tag);

        if(classes) el.classList.add(...classes);
  
        if(content) el.textContent = content;

        if(url) el.src = url;

        return el;
    }
}