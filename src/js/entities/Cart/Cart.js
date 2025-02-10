import CartItem from "./CartItem";
import RedrawBasketButton from "../../basketButton/RedrawBasketButton";

class Cart {
  constructor() {
    // this.cookies = `BITRIX_RR_LOGIN=%2B79654493064; BITRIX_RR_SALE_UID=111; BITRIX_SM_LOGIN=%2B79654493064; PHPSESSID=77MNubruWyqbIhXYqlD0SbXfV1CKaR2H`;

    // console.log('Cookies', this.cookies);
    const list = new RedrawBasketButton(document.querySelector('.header__basket'), null);
    list.redrawIconAmount()

    this.list = document.querySelector('.basket__goods-list');
    this.totalSumEl = document.querySelector('.basket__total-price-num span');
    this.totalPriceOldEl = document.querySelector('.basket__total-price-old');
    this.discountEl = document.querySelector('.basket__total-discount-num span');
    this.fetchData = this.fetchData.bind(this);
    this.render = this.render.bind(this);
    this.add = this.add.bind(this);
    this.items = [];
    this.total_price = {
      sum_with_discount: 0,
      sum_without_discount: 0,
    };
    this.fetchData().then(() => {
      this.render()
    });

    // Bindings
    this.render = this.render.bind(this);
    this.add = this.add.bind(this);

    // Event Listeners
    document.addEventListener('cartUpdated', this.render);
  }

  async fetchData() {
    const myHeaders = new Headers();
    // myHeaders.append('Cookie', this.cookies);

    // console.log('%cAll cookies:', 'color: blue; font-size: 20px;');
    // console.log(this.cookies)

    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'include',
    };

    // fetch('https://dev.r18.coffee/api/basket/get', requestOptions)
    const result = await fetch('https://dev.r18.coffee/api/basket/get', requestOptions);
    const result2 = await result.text();
    const result3 = JSON.parse(result2);
    // console.log('%cCart:', 'color: orange; font-size: 20px;');
    // console.log(result3);
    console.log(JSON.stringify(result3.items));
    localStorage.basket = JSON.stringify(result3.items);

    Object.assign(this, result3)

    this.dispatchCartUpdated();
    const event = new Event('cartUpdated');
    document.dispatchEvent(event);
    const list = new RedrawBasketButton(document.querySelector('.header__basket'), null);
    list.redrawIconAmount()

    // fetch('/api/basket/get', requestOptions)
    //   .then((response) => response.text())
    //   .then((result) => {
    //     console.log('%cCart:', 'color: orange; font-size: 20px;');
    //     console.log(JSON.parse(result));
    //     this.dispatchCartUpdated();
    //   })
    //   .catch((error) => console.error(error));
  }

  render() {
    console.log('%cСписок что у нас в корзине:', 'color: red; font-size: 20px;');
    console.log(this.items);

    const items = this.items.map(item => new CartItem(item));
    const html = items.map(item => item.render());

    if (this.list) {
        this.list.innerHTML = html.join('\n');
    } else {
        console.warn('Cart: Элемент .basket__goods-list не найден.');
    }

    if (this.totalPriceOldEl) {
        this.totalPriceOldEl.innerHTML = this.total_price.sum_without_discount;
    } else {
        console.warn('Cart: Элемент .basket__total-price-old не найден.');
    }

    if (this.totalSumEl) {
        this.totalSumEl.innerHTML = this.total_price.sum_with_discount;
    } else {
        console.warn('Cart: Элемент .basket__total-price-num span не найден.');
    }

    if (this.discountEl) {
        this.discountEl.innerHTML = this.total_price.sum_without_discount - this.total_price.sum_with_discount;
    } else {
        console.warn('Cart: Элемент .basket__total-discount-num span не найден.');
    }
}


  add(id) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    // console.log('%cAdd Headers:', 'color: red; font-size: 20px;');
    // myHeaders.append("Cookie", this.cookies);
    // console.log(myHeaders)
    // console.log(this.cookies);
    console.log([...myHeaders.entries()]);

    const raw = JSON.stringify({ product_id: id });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      credentials: 'include',
      redirect: 'follow',
    };

    // fetch("https://dev.r18.coffee/api/basket/add", requestOptions)
    fetch('https://dev.r18.coffee/api/basket/add', requestOptions)
      .then(this.fetchData)
      .then(this.dispatchCartUpdated)
      // .then((response) => response.text())
      // .then((result) => console.log(result))
      // .catch((error) => console.error(error));
  }

  remove(id) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    // console.log([...myHeaders.entries()]);

    const raw = JSON.stringify({ product_id: id });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      credentials: 'include',
      redirect: 'follow',
    };

    fetch('https://dev.r18.coffee/api/basket/remove', requestOptions)
      .then(this.fetchData)
      .then(this.dispatchCartUpdated)
  }

  // increment(id) {}

  // decrement(id) {}

  clear() {}

  dispatchCartUpdated() {
    const event = new Event('cartUpdated');
    document.dispatchEvent(event);
  }
}

window.cart = new Cart();

//это Класс на отображение данных корзины на странице оформления заказа
class OrderCart {
  constructor(cart) {
      this.cart = cart;
      this.list = document.querySelector('.place-order__order-list');
      this.render = this.render.bind(this);

      // Подписываемся на событие cartUpdated
      document.addEventListener('cartUpdated', this.render);
  }

  render() {
    console.log('Cart items:', this.cart.items); 

    if (!this.list) {
        console.warn('OrderCart: Элемент .place-order__order-list не найден.');
        return;
    }

    if (this.cart.items.length === 0) {
        this.list.innerHTML = '<li class="place-order__order-item_text">Нет товаров в корзине</li>';
        return;
    }

    const items = this.cart.items.map(item => new CartItem(item));
    const html = items.map(item => 
        `<li class="place-order__order-item">
            <div class="place-order__product-info">
                <div class="place-order__product-wr-img">
                    <img class="place-order__product-img" src="${item.product.PROPS.PROPERTY_PICTURES_VALUE}" alt="${item.product.NAME}" />
                </div>
                <div class="place-order__product-wr-description">
                    <p>${item.product.PROPS.NAME}</p>
                    <p>${item.product.PROPS.PROPERTY_BASKET_DESC_VALUE}</p>
                </div>
                <div class="place-order__product-wr-amount">
                    <span class="place-order__product-amount">${item.product.QUANTITY}</span>
                    <span>шт</span>
                </div>
            </div>
            <div class="place-order__product-price">
                <span>${item.product.sum_with_discount}</span> р.
            </div>
        </li>`
    ).join('\n');

    const totalPriceWithDiscount = this.cart.total_price.sum_with_discount;
    const totalPriceWithoutDiscount = this.cart.total_price.sum_without_discount;
    const discount = totalPriceWithoutDiscount - totalPriceWithDiscount;

    // HTML для итогов заказа
    const totalHtml = `
        <li class="place-order__order-summary">
    <div class="place-order__discount">
        <span class="place-order__discount-label">Скидка:</span>
        <span class='place-order__discount-label_span'>${discount} р.</span>
    </div>
    <div class="place-order__total">
        <span class="place-order__total-label">Итого:</span>
        <span class='place-order__total-label_span'>${totalPriceWithDiscount} р.</span>
    </div>
</li>
    `;

    // Обновление HTML
    this.list.innerHTML = html + totalHtml;
}

}

const orderCart = new OrderCart(cart);

export default orderCart;