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

  render() {
    const {
      PRODUCT_ID,
      NAME,
      PRICE,
      QUANTITY,
      DISCOUNT_PRICE,
      BASE_PRICE,
      DISCOUNT,
      SERVICE_ID,
      sum_with_discount,
      sum_without_discount,
      PROPS,
    } = this.product;

    const IMAGE_PATH = CartItem.getImagePath(PROPS.PROPERTY_PICTURES_VALUE);

    // Рассчитываем общий вес (предполагаем, что каждый продукт - это 1 кг)
    const totalWeight = QUANTITY * 1; // 1 кг на каждую пачку (можно заменить на реальный вес)
    
    // Проверяем, есть ли скидка на основе общего веса
    let discountMessage = '';
    if (totalWeight >= 10) {
      discountMessage = `
        <p style="color: white;">
          Скидка составляет <span style="color: #F6724A;">10%</span>, так как Вы заказали более <span style="color: #F6724A;">10 кг</span> кофе
        </p>`;
    }

    return (`
      <li
        class="basket__goods-item"
        data-index="5"
        data-sku_title="${NAME}"
        data-sku_packing="${NAME}"
        data-article="1"
      >
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
            ${discountMessage} <!-- Добавляем сообщение о скидке -->
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
    if (path.match(/http?s:\/\/localhost/)) {
      return path.replace('localhost', 'dev.r18.coffee');
    }
    return path;
  }
}


