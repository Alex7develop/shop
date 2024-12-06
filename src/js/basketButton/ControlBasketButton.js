import ApiModals from '../api-modals/ApiModals.js';

export default class ControllBasketButton extends ApiModals {
    constructor(redraw, IMask) {
        super();
        this.redraw = redraw;
        this.IMask = IMask;
    
        this.click = this.click.bind(this);
        this.clickBasket = this.clickBasket.bind(this);
        this.addToBasket = this.addToBasket.bind(this);
        this.bloor = this.bloor.bind(this);

        this.mask;
    }

    init() {  
        // this.registerEvents();           // отключен весь функционал по корзине формирование и тд
        // this.redraw.redrawIconAmount();

        // подсвечиваем иконку при заходе на страницу корзина
        const path = location.pathname;
        if(path.includes('basket') || path.includes('place-an-order')) {
            this.redraw.redrawIconBasket();
        }
    }

    registerEvents() {
        this.redraw.el.addEventListener('click', this.click);
        this.redraw.mobileEl.addEventListener('click', this.click);
    }

    
    // нажатие на КНОПКУ ACCOUNT в HEADER
    click(e) {
        if(e.target.closest('.header__basket') ||
        e.target.dataset.item === 'basket') {
            // ---- pop-up basket
            (async () => {
                const basket = await super.read('basket');
                this.redraw.openNewModal(basket);

                this.redraw.lastActiveModal.addEventListener('click', this.clickBasket);

                // НАЗНАЧАЕМ СЛУШАТЕЛИ НА КОРЗИНУ (МОДАЛКУ КОРЗИНЫ)
                // собираем инпуты в корзине и назначаем слушать
                // для того чтобы пользователь мог ввести количество руками
                const inputs = this.redraw.lastActiveModal
                    .querySelectorAll('.modal-basket__goods-amount-num');

                if(inputs) {
                    [...inputs].forEach(item => item
                        .addEventListener('change', this.bloor));
                }

                // на телефон формы регистрации вешаем при фокусе маску
                const form = this.redraw.lastActiveModal.querySelector('form');

                form.phone.addEventListener('focus', (e) => {
                    this.mask = new this.IMask(e.target, {
                        mask: '+{7} (000) 000-00-00',
                        lazy: false,
                        placeholderChar: '_',
                    })

                    form.phone.addEventListener('blur', (e) => {
                        const phone = e.target.value;
                        const result = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(phone);
                        if(!result) {
                            this.mask.destroy();
                            e.target.value = '';
                        };
                    })
                })
            })()
        }
    }

    clickBasket(e) {
        // закрытие корзины
        if(e.target.closest('.modal__close')) this.redraw.closeModal();

        // кнопки в корзине + или -
        if(e.target.closest('.modal-basket__goods-amount-button')) {
            const button = e.target.closest('.modal-basket__goods-amount-button');
            // меняем и показываем количество товара в корзине (визуально на странице)
            this.redraw.calcAmountGoods(button); 


            // пересчет количества в корзине в localStorage хранилище
            // при нажатии + или -
            const li = button.closest('li');

            let counter;

            counter = button.dataset.type === 'increment' ? 1 : -1;

            // Собираем параметры для добавления параметров в метод addToBasket
            const dataForToBasket = {
                index : li.dataset.index,
                article : li.dataset.article,
                title : li.dataset.sku_title,
            }
            // получаем данные есть ли помол
            let grinding = li.dataset?.grinding;
            if(grinding ) dataForToBasket.grinding = grinding;

            this.addToBasket(dataForToBasket, counter);
        }

        // отправляем заказ на сервер и показываем соответствующую модалку
        if(e.target.closest('.modal-basket__button')) {

            // Открытие модалки заказ успешно или не успешно отправлен
            // результат отправки
            const resultSend = true;
            (async () => {
                // тип модалки
                let typeModal = 'order-successfully';
                if(!resultSend) typeModal = 'failed';

                const orderSuccessfully = await super.read(typeModal);
                this.redraw.openNewModal(orderSuccessfully);

                this.redraw.lastActiveModal.addEventListener('click', (e) => {
                    // закрытие корзины
                    if(e.target.closest('.modal__close')) this.redraw.closeModal();
                });

                const order = localStorage?.basket ? JSON.parse(localStorage.basket) : '';
                console.log('ORDER: ', order)

                this.clearLocalStorage();

                this.redraw.redrawIconAmount()
            })() 
        }
    }

    // метод для отлавливания изменений в корзине в input 
    // когда количество вводится не нажатием + или -
    // вводится сразу количество товара
    bloor(e) {
        const value = +e.target.value;
        const basket = JSON.parse(localStorage.basket);
         
        delete localStorage.basket;

        const li = e.target.closest('li');
        const article = li.dataset.article;
        const title = li.dataset.sku_title;
        const indexItem = li.dataset.index;
        const grinding = li.dataset?.grinding ? li.dataset?.grinding : false;

        // изменение количества товара в корзине без + - 
        // только при вводе цифры в input с количеством
        basket.forEach((item, index, array) => {
            // ищем по двум параметрам т.к. один может быть одинаков у нескольких
            if((!grinding && item.article == article && item.title == title) ||
            (grinding && item.article == article && item.title == title && grinding === item.grinding)) {
                item.amount = value;
                // если количество единицы товара 0, удаляем его из корзины везде
                if(item.amount <= 0){
                    array.splice(index, 1); // удалить из basket
                    this.redraw.deleteProduct(indexItem); // удалить с экрана
                };
                // если в корзине не осталось товаров чистим localStorage
                if(array.length === 0) {
                    this.clearLocalStorage();
                }
            }
        })

        if(basket.length) localStorage.basket = JSON.stringify(basket);
        
        // перерисовка/отрисовка значка корзины с количеством товаров в ней
        this.redraw.redrawIconAmount();
    }


    // Добавляет в корзину и если уже есть увеличивает на 1,
    // а также работает с increment и decrement
    /**
     * необходимые data для поиска и расчета
     * article
     * title
     * grinding
     * */ 
    addToBasket(data, amount = 1) {
        // article: "3"
        // color: ""
        // imgUrl: ['./img/content/accessories-nok-box-motta-105-content.webp']
        // price: "4 000 p."
        // sectionName: "accessories"
        // size: "105 мм"
        // title: "Нок-бокс"

        // если корзина пуста
        if(!localStorage.basket) {
            localStorage.basket = JSON.stringify([data]);
            
            // перерисовка/отрисовка значка корзины с количеством товаров в ней
            this.redraw.redrawIconAmount();
            return;
        }

        // если в корзине уже что то есть
        const basket = JSON.parse(localStorage.basket);
        delete localStorage.basket;

        // проверка добавлялся ли уже такой продукт в корзину
        const product = basket.find(item => {
            // если в товаре нет помола то это не фильтр кофе
            if(!item?.grinding) {
                return item.article === data.article && item.title === data.title
            }
            // иначе если в товаре есть помол то это фильтр кофе
            return item.article === data.article && item.title === data.title && item.grinding === data.grinding
        })

        // если такого продукта в корзине нет закидываем его туда
        if(!product) {
            basket.push(data);
            localStorage.basket = JSON.stringify(basket);

            // перерисовка/отрисовка значка корзины с количеством товаров в ней
            this.redraw.redrawIconAmount();
            return;
        }

        // если найден, уже добавлялся, увеличиваем количество на 1 или уменьшаем на -1 
        // (при нажатии в корзине на значек -)
        // расчет зависит от amount положительное там число или отрицательное
        basket.forEach((item, index, array) => {
            // если в данных о товаре нет помола
            // ищем по нескольким параметрам т.к. один может быть одинаков у нескольких
            // также проверяем указан ли в объекте товара помол (grinding)
            if((!item?.grinding && item.article === data.article && item.title === data.title) ||
            (item?.grinding && item.article === data.article && item.title === data.title && item.grinding === data.grinding)) {

                item.amount = item.amount + amount; // amount может быть + или -

                // если количество единицы товара 0, удаляем его из корзины везде
                if(item.amount <= 0){
                    array.splice(index, 1); // удалить из basket
                    this.redraw.deleteProduct(data.index); // удалить с экрана
                };
                // если в корзине не осталось товаров чистим localStorage
                if(array.length === 0) {
                    this.clearLocalStorage();
                }
            }
        })

        if(basket.length) localStorage.basket = JSON.stringify(basket);
        
        // перерисовка/отрисовка значка корзины с количеством товаров в ней
        this.redraw.redrawIconAmount();
    }


    clearLocalStorage() {
        if(localStorage?.basket) {
            delete localStorage.basket;
        }
        localStorage.clear()
    }

    
    // валидация заполненности полей
    validation(inputs) { 
        inputs.forEach(item => {
            // поле не заполненно
            if(!item.value) { // валидация
                this.redraw.incorrectData(item, 'Заполните пожалуйста поле');
            }
        })
    }
}