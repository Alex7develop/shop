import CartItem from "./CartItem";

class Cart {
  constructor() {
    // this.cookies = `BITRIX_RR_LOGIN=%2B79654493064; BITRIX_RR_SALE_UID=111; BITRIX_SM_LOGIN=%2B79654493064; PHPSESSID=77MNubruWyqbIhXYqlD0SbXfV1CKaR2H`;

    // console.log('Cookies', this.cookies);

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
    const result = await fetch('/api/basket/get', requestOptions);
    const result2 = await result.text();
    const result3 = JSON.parse(result2);
    // console.log('%cCart:', 'color: orange; font-size: 20px;');
    // console.log(result3);

    Object.assign(this, result3)

    this.dispatchCartUpdated();

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
    
    // console.log('%cCart items list:', 'color: red; font-size: 20px;');
    // console.log(this.items);

    const items = this.items.map(item => new CartItem(item));
    const html = items.map(item => item.render());

    if (this.list) 
      this.list.innerHTML = html.join('\n');
    if (this.totalPriceOldEl) 
      this.totalPriceOldEl.innerHTML = this.total_price.sum_without_discount;
    if (this.totalSumEl)
      this.totalSumEl.innerHTML = this.total_price.sum_with_discount;
    if (this.discountEl)
      this.discountEl.innerHTML = this.total_price.sum_without_discount - this.total_price.sum_with_discount;
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
    fetch('/api/basket/add', requestOptions)
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

    fetch('/api/basket/remove', requestOptions)
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

// export default cart;
