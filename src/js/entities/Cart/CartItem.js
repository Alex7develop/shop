/**
 * This is just a reference
 * You should definetely remove this 'product' object
 */

const product = {
  "PRODUCT_ID": "85",
  "NAME": "colombia andino",
  "PRICE": 2000,
  "QUANTITY": 8,
  "DISCOUNT_PRICE": "0.0000",
  "BASE_PRICE": 2000,
  "DISCOUNT": 0,
  "SERVICE_ID": "93",
  "sum_with_discount": 16000,
  "sum_without_discount": 16000,
  "PROPS": {
      "NAME": "colombia andino",
      "PROPERTY_BASKET_DESC_VALUE": "Какое-то описание",
      "PROPERTY_PICTURES_VALUE": "https://localhost/upload/iblock/b08/rfz6h38l13o3k12dsattgw6f1kzj60to.webp"
  }
}

window.handleIncrement = function(id) {
  window.cart.add(id);
}

window.handleDecrement = function(id) {
  window.cart.remove(id);
  // alert(id);
  // const { PRODUCT_ID } = this.product;
}

export default class CartItem {
  constructor(product) {
    this.product = product;
  }

  checkDiscount() {
    const { QUANTITY, PRODUCT_ID } = this.product;

    const espressoIds = ['85', '87', '89', '91', '93'];
    const dripIds = ['97'];
    const filterIds = ['109', '110', '111', '112', '114', '115', '116', '1117'];
    
    let discountMessage = '';

    if (espressoIds.includes(PRODUCT_ID) && QUANTITY >= 10) {
      discountMessage = `
        <p class="basket__goods-info-text" style="color: white; margin: 0;">
          Скидка составляет <span style="color: #F6724A; font-weight: 600;">10%</span>, так как Вы заказали более <span style="color: #F6724A; font-weight: 600;">10 кг</span> кофе
        </p>`;
    } else if (dripIds.includes(PRODUCT_ID) && QUANTITY >= 10) {
      discountMessage = `
        <p class="basket__goods-info-text" style="color: white; margin: 0;">
          Скидка составляет <span style="color: #F6724A; font-weight: 600;">10%</span>, так как Вы заказали более <span style="color: #F6724A; font-weight: 600;">10 пачек зерна</span>
        </p>`;
    } else if (filterIds.includes(PRODUCT_ID) && QUANTITY >= 10) {
      discountMessage = `
        <p class="basket__goods-info-text" style="color: white; margin: 0;">
          Скидка составляет <span style="color: #F6724A; font-weight: 600;">10%</span>, так как Вы заказали более <span style="color: #F6724A; font-weight: 600;">10 Дрип пакетов</span> кофе
        </p>`;
      }

    return discountMessage;
  }

  render() {
    const {
      PRODUCT_ID,
      NAME,
      QUANTITY,
      sum_with_discount,
      sum_without_discount,
      PROPS,
    } = this.product;

    console.log("%cКартинки в объекте ===> ', 'color: red; font-size: 20px;", PROPS.PROPERTY_PICTURES_VALUE);
    const IMAGE_PATH = CartItem.getImagePath(PROPS.PROPERTY_PICTURES_VALUE);
    console.log("%cПервая картинка ТУТ:', 'color: teal; font-size: 20px;", PROPS.PROPERTY_PICTURES_VALUE[0]);
    const discountMessage = this.checkDiscount();

    return (`
      <li class="basket__goods-item" data-index="5" data-sku_title="${NAME}" data-sku_packing="${NAME}" data-article="1">
        <div class="basket__goods-wr-content">
          <div class="basket__goods-content">
            <div class="basket__goods-img">
              <img src="${IMAGE_PATH}" />
            </div>
            <div class="basket__goods-description">
              <p>${PROPS.NAME}</p>
              <p>${PROPS.PROPERTY_BASKET_DESC_VALUE}</p>
            </div>
          </div>
          <div class="basket__goods-amount-price">
            <div class="basket__goods-amount">
              <div class="basket__goods-amount-button" data-type="decrement" data-id="${PRODUCT_ID}" onclick="handleDecrement(${PRODUCT_ID})"></div>
              <input class="basket__goods-amount-num" type="text" placeholder="0" value="${QUANTITY}"/>
              <div class="basket__goods-amount-button" data-type="increment" data-id="${PRODUCT_ID}" onclick="handleIncrement(${PRODUCT_ID})"></div>
            </div>
          </div>
        </div>
        <div class="basket__goods-info-price">
          <div class="basket__goods-info">
            ${discountMessage}
          </div>
          <div class="basket__goods-wr-price">
            <div class="basket__goods-discount"><span>${sum_without_discount}</span> р.</div>
            <div class="basket__goods-price"><span>${sum_with_discount}</span> р.</div>
          </div>
        </div>
      </li>
    `);
  }

  static getImagePath(path) {
    return path.match(/http?s:\/\/localhost/) ? path.replace('localhost', 'dev.r18.coffee') : path;
  }
}

