export default class RedrawAccountProfile {
  constructor(el) {
    this.el = el;

    // все инпуты профайла пользователя личных данных пользователя и адреса
    this.inputsForms = {
      'user-data': this.el.querySelectorAll(
        '.profile__user-contacts-form input'
      ),
      address: (this.inputsUserAddress = this.el.querySelectorAll(
        '.profile__address-form input'
      )),
    };
    this.addressInputs = document.querySelectorAll('profile__address-input');
    // USER DATA
    this.formUserData = this.el.querySelector('form');
    // инпуты без радио, пола личных данных пользователя
    this.inputsUserDataText = this.el.querySelectorAll(
      '.profile__user-contacts-item > input'
    );

    this.phone = this.formUserData.phone;
    this.email = this.formUserData.email;

    this.phone.setAttribute('readonly', true);


    // кнопки профайла
    this.groupButtonsEdit = this.el.querySelector(
      '.profile__buttons-group-edit'
    );
    this.groupButtonSave = this.el.querySelector(
      '.profile__buttons-group-save'
    );

    // если в инпут ничего не ввели в профайле, чтоб было что вернуть
    this.lastInputValue = null;

    // ADDRESS
    // чекбокс для открытия списка имен адресов
    this.addressSelectCheckbox = this.el.querySelector(
      '#profile__wr-address-checkbox'
    );
    // Селект где отображается имя выбранного адреса если он есть
    this.addressesSelect = this.el.querySelector('.profile__wr-address-title');
    // список адресов
    this.addresses = this.el.querySelectorAll('.profile__address-item');

    // инпуты адреса пользователя
    this.buttonAddAdress = this.el.querySelector('.profile__button-add-adress');
    this.buttonSaveAdress = this.el.querySelector(
      '.profile__button-save-adress'
    );

    const addressListElement = this.el.querySelector('.profile__address-list');
  if (addressListElement) {
    addressListElement.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('profile__address-item')) {
      this.fillAddressForm(e.target.textContent);
      const event = new CustomEvent('addressSelected', {
        detail: e.target.textContent,
      });
      document.dispatchEvent(event);
    }
  });
}

    this.loadProfileData();
    this.addAddressButton = this.el.querySelector('.profile__button-add-adress');
  }

  async loadProfileData() {
    try {
      const response = await fetch('https://r18.coffee/api/auth/info', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки данных: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log('Данные профиля:', data);

      // Заполнение полей на странице
      document.querySelector('input[name="second_name"]').value =
        decodeURIComponent(data.LAST_NAME || 'Фамилия');
      document.querySelector('input[name="name"]').value = decodeURIComponent(
        data.NAME || 'Имя'
      );
      document.querySelector('input[name="patronymic"]').value =
        decodeURIComponent(data.
          patronymic
           || 'Отчество');
      document.querySelector('input[name="phone"]').value =
        data.PERSONAL_PHONE || 'Телефон';
      document.querySelector('input[name="email"]').value =
        data.EMAIL || 'Электронная почта';

      // Пол
      const genderInputs = document.querySelectorAll('input[name="gender"]');
      if (data.PERSONAL_GENDER === 'M') {
        genderInputs[0].checked = true;
      } else if (data.PERSONAL_GENDER === 'F') {
        genderInputs[1].checked = true;
      }

      // Дата рождения
      const birthDateInput = document.querySelector('input[name="born_date"]');
      if (data.PERSONAL_BIRTHDAY) {
        birthDateInput.value = new Date(
          data.PERSONAL_BIRTHDAY
        ).toLocaleDateString();
      } else {
        birthDateInput.value = '__/__/____';
      }

      // Обработка адресов
      const addressList = document.querySelector('.profile__address-list');
      if (data.ADDRESSES && Array.isArray(data.ADDRESSES)) {
        addressList.innerHTML = data.ADDRESSES.reverse().map(
          (address) =>
            `<li class="profile__address-item">${decodeURIComponent(
              address.ALIAS
            )}</li>`
        ).join('');
      } else {
        addressList.innerHTML =
          '<li class="profile__address-item">Нет адресов</li>';
      }
      this.toggleAddAddressButton(data.ADDRESSES.length);
    } catch (error) {
      console.error('Не удалось загрузить данные профиля:', error);
    }
  }

  fillAddressForm(addressName) {
    this.addressesSelect.textContent = addressName;
    this.addressSelectCheckbox.checked = false;

    // Convert NodeList to Array
    const addressArray = Array.from(this.addresses);

    // Now you can safely use .find on the array
    const address = addressArray.find(
      (item) => item.textContent === addressName
    );

    // console.log('%cSelected Address:', 'color: red; font-size: 20px;')
    // console.log(this.addresses);

    if (address) {
      // Заполняем поля формы соответствующими данными адреса
      this.inputsUserAddress.forEach((input) => {
        const fieldName = input.name;
        input.value = address.dataset[fieldName] || ''; // Используем data-атрибуты для хранения значений
      });
    }
  }

  // открываем редактирование формы
  openEditForm(type) {
    [...this.inputsForms[type]].forEach((item) =>
      item.removeAttribute('disabled')
    );

    this.inputsForms[type][0].focus();

    if (type === 'user-data') this.changeGroupButton();

    if (type === 'address')
      this.buttonSaveAdress.classList.remove('profile__button_disabled');
  }

  // закрываем возможность редактирования
  closeEditForm(type) {
    [...this.inputsForms[type]].forEach((item) =>
      item.setAttribute('disabled', '')
    );

    if (type === 'user-data') this.changeGroupButton();

    if (type === 'address') {
      this.buttonSaveAdress.classList.add('profile__button_disabled');
      this.buttonSaveAdress.removeAttribute('no-valid');
    }
  }

  // USER DATA
  // открываем возможность редактирования

  // очистка input при focus
  clearInput(el) {
    if (el.value) this.lastInputValue = el.value;

    if (el.hasAttribute('no-valid')) el.removeAttribute('no-valid');

    if (!el.closest('[name="phone"]')) el.value = '';

    if (el.closest('.profile__address-input'))
      el.classList.remove('profile__address-input_required');
  }

  // заполнение input при blur
  fillInput(el) {
    // если при потере фокуса в нем нет value, но оно там было
    // ставим предидущий
    if (!el.value && this.lastInputValue) {
      el.value = this.lastInputValue;

      if (this.lastInputValue === 'Неверно указана почта') {
        this.noValidUserData({ email: false });
      }

      // для адреса, определяем необходимость и ставим или нет звездочку
      if (el.closest('.profile__address-input')) {
        const dataValue = el.dataset.value;
        if (dataValue === this.lastInputValue) {
          el.classList.add('profile__address-input_required');
        }
        // если в форме уже были не валидные значения и в данном поле
        // при потере фокуса стандартное значение, значит показываем что оно не валидно
        if (
          this.buttonSaveAdress.hasAttribute('no-valid') &&
          dataValue === this.lastInputValue
        ) {
          this.noValidUserAddress([el]);
        }
      }
    }

    if (!el.value && !this.lastInputValue) {
      el.placeholder = this.lastPlaceholder;
    }
  }

  // переключает кнопки под формой с данными пользователя
  changeGroupButton() {
    this.groupButtonsEdit.classList.toggle(
      'profile__buttons-group-edit_active'
    );
    this.groupButtonSave.classList.toggle('profile__buttons-group-edit_active');
  }

  // заполняет ошибками поля с данными пользователя (не адрес)
  noValidUserData(data) {
    if (!data?.email) {
      this.email.value = 'Неверно указана почта';
      this.email.setAttribute('no-valid', '');
    }

    // if (!data?.phone) {
    //   this.phone.value = 'Неверно указан номер телефона';
    //   this.phone.setAttribute('no-valid', '');
    // }
  }

  // ADDRESS

  // показ в селект выбранного имени адреса при старте страницы
  setStartAddress() {
    if (this.addresses.length) {
      const value = this.addresses[0].textContent;
      this.addressesSelect.textContent = value;
    }

    this.countAddresses();
  }
  // показ в селект выбранного имени адреса при выборе
  choiceAddressName(value) {
    this.addressesSelect.textContent = value;
    // закрываем селект
    this.addressSelectCheckbox.checked = false;
  }

  /**
   * при добавлении нового адреса, меняет данные в форме на
   * стандартные стартовые и устанавливает метку обязательных
   * для заполнения полей
   * */
  fillStartValue() {
    [...this.inputsForms['address']].forEach((input) => {
      const dataValue = input.dataset.value;
      const value = input.value;

      // если поле не в фокусе и у него есть value и оно не стандартное
      if (value && dataValue !== value) input.value = dataValue;
      // если поле не в фокусе и унего соответственно не очищен value
      if (value) input.classList.add('profile__address-input_required');
    });
  }

  // показываем не валидные поля пользователю
  noValidUserAddress(elements) {
    elements.forEach((el) => el.setAttribute('no-valid', ''));

    this.buttonSaveAdress.setAttribute('no-valid', '');
  }

  countAddresses() {
    if (this.addresses.length === 3)
      this.buttonAddAdress.style.display = 'none';
  }
  toggleAddAddressButton(addressCount) {
    if (this.addAddressButton) {
      if (addressCount === 0 || addressCount >= 3) {
        this.addAddressButton.classList.add('profile__button_disabled');
        this.addAddressButton.disabled = true;
      } else {
        this.addAddressButton.classList.remove('profile__button_disabled');
        this.addAddressButton.disabled = false;
      }
    }
  }
}
//Отображение данных пользователя, реализовано редактирование и сохранение данных
class ProfileEditor {
  constructor() {
    this.inputsForms = {
      'user-data': document.querySelectorAll(
        '.profile__user-contacts-list input'
      ),
      address: document.querySelectorAll('.profile__address-input'),
    };
    this.buttonSaveUserData = document.querySelector('.profile__button_save');
    this.buttonSaveAddress = document.querySelector('.profile__button_save');

    this.apiUrl = ' /api/auth/updateprofile';
    this.initEventListeners();
  }

  initEventListeners() {
    if (this.buttonSaveUserData) {
      this.buttonSaveUserData.addEventListener('click', () =>
        this.saveUserData()
      );
    } else {
      console.error('Save button not found');
    }
  }

  openEditForm(type) {
    [...this.inputsForms[type]].forEach((item) =>
      item.removeAttribute('disabled')
    );
    if (type === 'user-data') this.changeGroupButton();
  }

  closeEditForm(type) {
    [...this.inputsForms[type]].forEach((item) =>
      item.setAttribute('disabled', '')
    );
    if (type === 'user-data') this.changeGroupButton();
  }

  changeGroupButton() {
    document
      .querySelector('.profile__buttons-group-edit')
      .classList.toggle('profile__buttons-group-edit_active');
    document
      .querySelector('.profile__buttons-group-save')
      .classList.toggle('profile__buttons-group-edit_active');
  }

  async saveUserData() {
    const data = this.collectUserData();
    const formattedData = this.formatData(data); // Преобразуем данные

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });
      const result = await response.json();

      // if (result.status === 'success') {
      //     this.handleSuccess();
      // } else {
      //     this.handleError(result.errors);
      // }
    } catch (error) {
      console.error('Ошибка сохранения данных:', error);
    }
  }

  collectUserData() {
    const form = document.querySelector('.profile__user-contacts-form');
    return {
      name: form.querySelector('input[name="name"]').value,
      last_name: form.querySelector('input[name="second_name"]').value,
      patronymic: form.querySelector('input[name="patronymic"]').value,
      email: form.querySelector('input[name="email"]').value,
      gender: form.querySelector('input[name="gender"]:checked').value,
      birthday: form.querySelector('input[name="born_date"]').value,
    };
  }

  // Функция для преобразования данных
  formatData(data) {
    return {
      name: data.name,
      last_name: data.last_name,
      patronymic:data.patronymic,
      email: data.email,
      gender: data.gender === 'man' ? 'M' : 'F', // Преобразование пола
      birthday: data.birthday.replace(/_/g, '').replace(/\//g, '.'), // Убираем символы "_" и "/" и ставим точки
    };
  }
  
  // handleSuccess() {
  //     alert('Данные успешно сохранены!');
  //     this.closeEditForm('user-data');
  // }

  // handleError(errors) {
  //     console.error('Ошибки:', errors);
  //     alert('Не удалось сохранить данные. Проверьте введенные значения.');
  // }
}

document.addEventListener('DOMContentLoaded', () => {
  const profileEditor = new ProfileEditor();
});

const keyMapping = {
  name: 'ALIAS',
  'zip-code': 'INDEX',
  area: 'OBLAST',
  city: 'GOROD',
  street: 'ULITSA',
  hause: 'DOM',
  appartment: 'OFIS',
  district: 'PODEZD',
  // 'address_etazh': 'ETAZH',
  // 'address_domofon': 'DOMOFON',
};

//Это рабочий запрос на бэк и отправка данных на бэк, создает адресс и возвращает в info
class AddressManager {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.addressInputs = document.querySelectorAll('.profile__address-input');
    this.buttonSaveAddress = document.querySelector(
      '.profile__button-save-adress'
    );
    this.addressList = document.querySelector('.profile__address-list');
    this.addressesSelect = document.querySelector('.profile__wr-address-title'); // элемент для отображения выбранного адреса

    // this.inputs = document.querySelectorAll('.profile__address-wr-input input');

    document.addEventListener('addressSelected', (event) =>
      this.handleAddressSelected(event)
    );

    this.initEventListeners();
    this.handleAddressSelected = this.handleAddressSelected.bind(this);
  }

  handleAddressSelected(event) {
    const { ADDRESSES } = window.userInfo;
    const { addressInputs } = this;
    console.log(ADDRESSES)
    console.log(addressInputs)
    const address = ADDRESSES.find((addr) => addr.ALIAS === event.detail);

    Object.entries(keyMapping).forEach(function ([key, KEY]) {
      const inputs = [];
      addressInputs.entries().forEach((entry) => inputs.push(entry[1]));
      const input = inputs.find((input) => input.name === key);
      input.value = address[KEY];
    });
  }

  initEventListeners() {
    if (this.buttonSaveAddress) {
      this.buttonSaveAddress.addEventListener('click', () =>
        this.saveAddress()
      );
    } else {
      console.error('Кнопка для сохранения адреса не найдена.');
    }
  }

  collectAddressData() {
    const data = {};
    this.addressInputs.forEach((input) => {
      const key = input.getAttribute('name');
      const formattedKey = this.formatKey(key);
      data[formattedKey] = input.value.trim();
    });
    return data;
  }

  formatKey(key) {
    return keyMapping[key] || key;
  }

  async saveAddress() {
    const addressData = this.collectAddressData();

    if (!this.validateAddressData(addressData)) {
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error(`Ошибка сохранения адреса: ${response.statusText}`);
      }

      const result = await response.json();
      // console.log('Адрес успешно сохранен:', result);

      this.addAddressToList(addressData.ALIAS);
      this.updateAddressSelect(addressData.ALIAS);
      alert('Адрес успешно сохранен!');

      this.clearAddressInputs();
    } catch (error) {
      console.error('Ошибка при сохранении адреса:', error);
      alert('Не удалось сохранить адрес. Попробуйте снова.');
    }
  }

  validateAddressData(data) {
    return Object.values(data).every((value) => value.trim() !== '');
  }

  addAddressToList(alias) {
    if (this.addressList) {
      const li = document.createElement('li');
      li.classList.add('profile__address-item');
      li.textContent = alias;
      this.addressList.appendChild(li);
    } else {
      console.error('Список адресов не найден.');
    }
  }

  updateAddressSelect(alias) {
    if (this.addressesSelect) {
      this.addressesSelect.textContent = alias;
    } else {
      console.error('Элемент для отображения выбранного адреса не найден.');
    }
  }

  clearAddressInputs() {
    this.addressInputs.forEach((input) => {
      input.value = '';
    });
  }
}

// Инициализация класса
document.addEventListener('DOMContentLoaded', () => {
  const addressManager = new AddressManager('https://r18.coffee/api/auth/createuseraddress');
});

class OrderList {
  constructor(apiUrl, containerSelector) {
    this.apiUrl = apiUrl;
    this.containerSelector = containerSelector;
    this.ordersContainer = document.querySelector(containerSelector);

    // Проверяем, найден ли элемент
    if (!this.ordersContainer) {
      console.warn(
        `Element with selector "${containerSelector}" not found. Creating a new container.`
      );
      const container = document.createElement('div');
      container.id = containerSelector.replace('#', ''); // Удаляем символ '#' из селектора
      document.body.appendChild(container);
      this.ordersContainer = container;
    }
  }

  isTargetPage() {
    const targetPageSelector =
      'li.account__tabs-item.account__tabs-history[data-type_acc="history"]';
    return document.querySelector(targetPageSelector) !== null;
  }

  async fetchOrders() {
    if (!this.isTargetPage()) {
      console.log('Target page not found.');
      return;
    }
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      // Проверяем, что данные являются массивом
      if (!Array.isArray(data)) {
        throw new Error('API response is not an array');
      }

      if (data.length === 0) {
        this.renderError();
        return;
      }

      // Преобразуем и рендерим заказы
      const transformedOrders = data.map((order) =>
        this.transformOrderData(order)
      );
      this.renderOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      this.renderError();
    }
  }

  renderOrders(orders) {
    if (!this.ordersContainer) {
      console.error('Cannot render orders: ordersContainer is null.');
      return;
    }
    this.ordersContainer.innerHTML = orders
      .map((order) => `<div class="order-item">${order.name}</div>`)
      .join('');
  }

  renderError() {
    if (!this.ordersContainer) {
      console.error('Cannot render error: ordersContainer is null.');
      return;
    }
    this.ordersContainer.innerHTML =
      '<div class="error">Failed to load orders. Please try again later.</div>';
  }

  transformOrderData(data) {
    return {
      id: data.ID || 'Неизвестно',
      deliveryType: data.Delivery_type || 'Не указан',
      address: data.Address || '',
      dateCreated:data.Date_created,
      deliveryDate: {
        from: data.Delivery_data_from || '',
        to: data.Delivery_data_to || '',
      },
      price: parseFloat(data.Price) || 0,
      state: data.State || 'Неизвестно',
      items: Array.isArray(data.Entities)
        ? data.Entities.map((entity) => {
            const product = entity.MAINS || {};
            return {
              name: product.NAME || 'Неизвестно',
              quantity: entity.BASKET_QUANTITY || 0,
              grind: product.PROPERTY_POMOL_VALUE || 'Не указано',
              roast: product.PROPERTY_OBJARKA_VALUE || 'Не указано',
              variety: product.PROPERTY_SORT_VALUE || 'Не указано',
              weight: product.PROPERTY_VES_VALUE || 'Не указано',
              year: product.PROPERTY_YROJAI_VALUE || 'Не указано',
              image: (product.PROPERTY_PICTURES_VALUE_SRC || [])[0] || '',
              size: product.PROPERTY_SIZE_VALUE || 'Не указано',
            };
          })
        : [],
    };
  }

  renderOrders(orders) {
  this.ordersContainer.innerHTML = '';

  orders.forEach((order) => {
    const orderItem = document.createElement('li');
    orderItem.classList.add('history__item');

    orderItem.innerHTML = `
      <div class="history__delivery">${order.deliveryType}</div>
      <div class="history__delivery-cost">
        Итоговая сумма: <span class="history__delivery-cost_num">${order.price.toFixed(0)}</span>
        <span class="history__delivery-cost_currency">р.</span>
      </div>
      <div class="history__delivery-address">${order.address}</div>
      <div class="history__delivery-date"> Ожидаемая дата доставки:
      ${getDeliveryDate((order.dateCreated))}
      </div>
      <div class="history__order-number"><span class="history__order-number_num">${order.id}</span></div>
      <ul class="history__order-state-list">
        ${this.getOrderStateList(order.state)}
      </ul>
      <div class="history__wr-details">
        <input class="history__details-title_checkbox" type="checkbox" />
        <label class="history__details-title" data-state="0">
          <span class="history__details-title-text">Посмотреть детали заказа</span>
          <span class="history__details-title-arrow"></span>
        </label>
        <ul class="history__details-list">
          ${order.items
            .map((item) => {
              let details = [];

              if (item.grind && item.grind !== 'Не указано') details.push(`<p>Помол: ${item.grind}</p>`);
              if (item.roast && item.roast !== 'Не указано') details.push(`<p>Обжарка: ${item.roast}</p>`);
              if ((item.variety && item.variety !== 'Не указано') || (item.weight && item.weight !== 'Не указано')) {
                let varietyWeight = [];
                if (item.variety && item.variety !== 'Не указано') varietyWeight.push(`Сорт: ${item.variety}`);
                if (item.weight && item.weight !== 'Не указано') varietyWeight.push(`Вес: ${item.weight}`);
                details.push(`<p>${varietyWeight.join(', ')}</p>`);
              }
              if (item.year && item.year !== 'Не указано') details.push(`<p>Урожай: ${item.year}</p>`);

              // Add size details if available
              if (item.size && item.size !== 'Не указано') details.push(`<p>Размер: ${item.size}</p>`);

              return `
                <li class="history__details-item">
                  <div class="history__details-wr-img">
                    <img src="${item.image}" alt="фото заказанного товара">
                  </div>
                  <div class="history__details-description">
                    <p>${item.name}</p>
                    ${details.length > 0 ? details.join('') : ''}
                  </div>
                  <div class="history__details-amount">
                    <span class="history__details-amount-num">${item.quantity}</span>
                    <span class="history__details-amount_unit">шт</span>
                  </div>
                </li>
              `;
            })
            .join('')}
        </ul>
      </div>
    `;

    this.ordersContainer.appendChild(orderItem);
  });
}



  getOrderStateList(state) {
    const states = [
      'Новый заказ',
      'В работе',
      'Ожидаем оплату',
      'Оплачен',
      'Выполнен',
      'Отменен',
      'Передан в доставку',
      'В обработке',
    ];
    return states
      .map(
        (s) => `
      <li class="history__order-state-item ${
        s === state ? 'history__order-state-item_active' : ''
      }">${s}</li>
    `
      )
      .join('');
  }

  renderError() {
    this.ordersContainer.innerHTML = `
        <div class="error-message_list">Вы не сделали ни одного заказа.</div>
      `;
  }
}

// Пример использования
const orderList = new OrderList('https://r18.coffee/api/order/list', '.history__list');
orderList.fetchOrders();

//Это класс для отображения оформления заказа
class UserProfile {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async loadProfileData() {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки данных: ${response.statusText}`);
      }

      const data = await response.json();

      // Заполнение полей на странице
      document.querySelector('h1.place-order__main-title').textContent =
        'Оформление заказа';
      document.querySelector(
        '.place-order__user-data-item:nth-child(1)'
      ).textContent = '' + decodeURIComponent(data.LAST_NAME || 'Фамилия');
      document.querySelector(
        '.place-order__user-data-item:nth-child(2)'
      ).textContent = '' + decodeURIComponent(data.NAME || 'Имя');
      document.querySelector(
        '.place-order__user-data-item:nth-child(3)'
      ).textContent =
        '' + decodeURIComponent(data.patronymic || 'Отчество');
      document.querySelector(
        '.place-order__user-data-item:nth-child(4)'
      ).textContent = '' + (data.PERSONAL_PHONE || 'Телефон');
      document.querySelector(
        '.place-order__user-data-item:nth-child(5)'
      ).textContent = '' + (data.EMAIL || 'Электронная почта');
      // const patronymicElement = document.querySelector(
      //   '.place-order__user-data-item:nth-child(3)'
      // );
      // if (patronymicElement) {
      //   patronymicElement.style.display = 'none';
      // }
    } catch (error) {
      console.error('Не удалось загрузить данные профиля:', error);
    }
  }
}

const userProfile = new UserProfile('https://r18.coffee/api/auth/info');
userProfile.loadProfileData();

class PlaceOrderAddress {
  constructor(el) {
    this.el = el;

    // Контейнер списка адресов
    this.addressList = this.el.querySelector('.place-order__type-address-list');

    // Чекбокс для выбора адреса
    this.addressSelectCheckbox = this.el.querySelector(
      '#place-order__type-address-check'
    );

    // Заголовок с выбранным именем адреса
    this.addressTitle = this.el.querySelector(
      'Ваш адрес'
    );

    this.init();
  }

  async init() {
    await this.loadAddresses();
    this.initEventListeners();
  }

  async loadAddresses() {
    try {
      const response = await fetch('https://r18.coffee/api/auth/info', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки адресов: ${response.statusText}`);
      }

      const data = await response.json();

      // Проверяем наличие адресов в ответе
      if (data && data.ADDRESSES && Array.isArray(data.ADDRESSES)) {
        this.renderAddressList(data.ADDRESSES);
      } else {
        this.renderEmptyAddressMessage();
      }
    } catch (error) {
      console.error('Ошибка загрузки адресов:', error);
      this.renderEmptyAddressMessage();
    }
  }

  renderAddressList(addresses) {
    const addressItems = addresses.reverse()
      .map(
        (address) =>
          `<div class="place-order__type-address-item">${decodeURIComponent(
            address.ALIAS
          )}</div>`
      )
      .join('');
    this.addressList.innerHTML = addressItems;
    window.addressListRaw=addresses;
  }

  renderEmptyAddressMessage() {
    this.addressList.innerHTML =
      '<div class="place-order__type-address-item">Нет доступных адресов</div>';
  }

  initEventListeners() {
    this.addressList.addEventListener('click', (e) => {
      if (
        e.target &&
        e.target.classList.contains('place-order__type-address-item')
      ) {
        this.selectAddress(e.target.textContent);
      }
    });
  }

  selectAddress(addressName) {
    this.addressTitle.textContent = addressName;
    this.addressSelectCheckbox.checked = false;
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  const placeOrderEl = document.querySelector('.place-order__wr-type-address');
  if (placeOrderEl) {
    new PlaceOrderAddress(placeOrderEl);
  }
});

//Это просто запрос
// async function fetchDeliveryAndPayment() {
//     try {
//         let response = await fetch(' /api/order/delivery_and_payment', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({})
//         });

//         if (!response.ok) {
//             throw new Error('Ошибка при отправке POST запроса');
//         }

//         let data = await response.json();
//         console.log(data);
//     } catch (error) {
//         console.error('============================>:', error);
//     }
// }

// fetchDeliveryAndPayment();

//Получение типов оплаты от Димы
class OrderDeliveryAndPayment {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async fetchDeliveryAndPayment(data) {
    try {
      let response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Ошибка при запросе данных!');
      }

      let responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Ошибка:', error);
    }
  }
}

let orderDeliveryAndPayment = new OrderDeliveryAndPayment(
  'https://r18.coffee/api/order/delivery_and_payment'
);

orderDeliveryAndPayment
  .fetchDeliveryAndPayment({
    /* Запрашиваю типы доставки*/
  })
  .then((data) => {
    let deliveries = Object.values(data);

    deliveries.forEach((delivery) => {
      let deliveryName = delivery.NAME;
      let deliveryID = delivery.ID;

      let payments = delivery.PAYMENTS.map((payment) => {
        return {
          paymentName: payment.NAME,
          paymentID: payment.ID,
        };
      });

      console.log(`Способ доставки: ${deliveryName}, ID: ${deliveryID}`);
      console.log(
        '%cСпособы оплаты:',
        'color: teal; font-size: 20px;',
        payments
      );
    });
  });

// Импортируем класс ApiModals
import ApiModals from '../api-modals/ApiModals';

const apiModals = new ApiModals();
function createCustomAlertModal() {
  const modalWrapper = document.createElement('div');
  modalWrapper.id = 'custom-alert-modal';
  modalWrapper.className = 'custom-modal-wrapper';
  modalWrapper.style.display = 'none';

  const modal = document.createElement('div');
  modal.className = 'custom-modal';

  const modalText = document.createElement('p');
  modalText.className = 'custom-modal__text';

  const closeButton = document.createElement('button');
  closeButton.className = 'custom-modal__close-button';
  closeButton.textContent = 'Закрыть';

  // Добавляем элементы в модальное окно
  modal.appendChild(modalText);
  modal.appendChild(closeButton);
  modalWrapper.appendChild(modal);

  // Добавляем модальное окно в body
  document.body.appendChild(modalWrapper);

  // Обработчик закрытия модального окна
  closeButton.addEventListener('click', () => {
    modalWrapper.style.display = 'none';
  });
}

// Инициализация модального окна при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  createCustomAlertModal();
});

// Функция для показа модального окна с сообщением
function showCustomAlert(message) {
  const modalWrapper = document.getElementById('custom-alert-modal');
  const modalText = modalWrapper.querySelector('.custom-modal__text');

  modalText.textContent = message;
  modalWrapper.style.display = 'flex';
}
function submitOrder() {
  const orderData = {
    delivery_id: '',
    address: {},
    oplata: '',
    ur_litso: false,
    comment: '',
    items: []
  };

  // Проверка на пустую корзину
  const cartItems = document.querySelectorAll('.place-order__order-item');
  if (cartItems.length === 0) {
    showCustomAlert('Корзина пуста. Добавьте товары для оформления заказа.');
    return;
  }

  // Проверка на выбор способа доставки
  var deliveryType = document.querySelector('.place-order__receiving-item_active');
  if (!deliveryType || !deliveryType.dataset.receiving) {
    showCustomAlert('Выберите способ доставки.');
    return;
  }

  // Проверка на выбор адреса доставки
  var addressForm = document.querySelector('.place-order__forms-address-item_active form');

  // Заполнение данных адреса
  if (addressForm) {
    const formData = new FormData(addressForm);
    orderData.address = {
      alias: formData.get('alias') || '',
      index: formData.get('zip') || '',
      oblast: formData.get('area') || '',
      gorod: formData.get('city') || '',
      ulitsa: formData.get('street') || '',
      dom: formData.get('hause') || '',
      podezd: formData.get('entrance') || '',
      etazh: formData.get('stage') || '',
      domofom: formData.get('intercom') || '',
      room: formData.get('appartment') || '',
    };
  }

  // Заполнение данных из сохраненного адреса
  if ("undefined" !== typeof window.selectAddressText && window.selectAddressText && "undefined" !== typeof window.addressListRaw) {
    var seleedAddr = window.selectAddressText;
    for (var nn in window.addressListRaw) {
      var currentItem = window.addressListRaw[nn];
    console.log("currentItem: ", currentItem);
      if (currentItem.ALIAS == seleedAddr) {
        orderData.address.alias = currentItem.ALIAS;
        orderData.address.index = currentItem.INDEX;
        orderData.address.oblast = currentItem.OBLAST;
        orderData.address.gorod = currentItem.GOROD;
        orderData.address.ulitsa = currentItem.ULITSA;
        orderData.address.dom = currentItem.DOM;
        orderData.address.podezd = currentItem.PODEZD;
        orderData.address.etazh = currentItem.ETAZH;
        orderData.address.domofon = currentItem.DOMOFON;
        orderData.address.room  = "undefined" !== typeof currentItem.ROOM ? currentItem.ROOM : "";
      }
    }
  }

  
  // Заполнение данных доставки
  const delivery_type = deliveryType.dataset.receiving;
  if (delivery_type === 'pickup') {
    orderData.delivery_id = 6;
  } else if (delivery_type === 'moskow') {
    orderData.delivery_id = 7;
  } else if (delivery_type === 'moskow-area') {
    orderData.delivery_id = 8;
  } else if (delivery_type === 'regions') {
    orderData.delivery_id = 9;
  } else if (delivery_type === 'cdek') {
    orderData.delivery_id = 10;
  }

  if (delivery_type === 'moskow') {
    if (!orderData.address.gorod || !orderData.address.ulitsa || !orderData.address.dom || !orderData.address.room) {
      showCustomAlert('Заполните обязательные поля!');
      return;
    }
  }

  if (delivery_type === 'moskow-area' || delivery_type === 'regions') {
    if (!orderData.address.index || !orderData.address.gorod || !orderData.address.ulitsa || !orderData.address.dom || !orderData.address.room) {
      showCustomAlert('Заполните обязательные поля!');
      return;
    }
  }

  // Заполнение данных оплаты
  const paymentInput = document.querySelector('.place-order__payment-type_active');
  if (paymentInput && paymentInput.dataset.payment_type) {
    const paymentType = paymentInput.dataset.payment_type;
    if (paymentType === 'cash') {
      orderData.oplata = 3;
    } else if (paymentType === 'card-site') {
      orderData.oplata = 4;
    } else if (paymentType === 'card-place') {
      orderData.oplata = 5;
    } else if (paymentType === 'legal') {
      orderData.oplata = 6;
      orderData.ur_litso = true;
    }
  }

  // Проверка на выбор типа оплаты
  if (!paymentInput || !paymentInput.dataset.payment_type) {
    showCustomAlert('Выберите тип оплаты.');
    return;
  }

  // Заполнение данных для Юрлица
  if (orderData.oplata === 6) {
    const orgForm = paymentInput.parentNode.querySelector(".place-order__payment-form");
    if (!orgForm) {
      showCustomAlert('Заполните данные для Юрлица.');
      return;
    }
    const orgFormData = new FormData(orgForm);
    const userOrgData = {
      inn: orgFormData.get("inn") || "",
      name: orgFormData.get("name") || "",
      address: orgFormData.get("address") || "",
      ogrn: orgFormData.get("ogrn") || ""
    };

    if (userOrgData.name.trim() === "") {
      showCustomAlert('Укажите название организации.');
      return;
    }

    if (userOrgData.address.trim() === "") {
      showCustomAlert('Укажите адрес организации.');
      return;
    }

    if (!/[\d]{10,12}/.test(userOrgData.inn)) {
      showCustomAlert('ИНН должен содержать только цифры (12 символов).');
      return;
    }

    if (!/[\d]{13}/.test(userOrgData.ogrn)) {
      showCustomAlert('ОГРН/OГРНИП должен содержать только цифры (13 символов).');
      return;
    }

    orderData.orgData = userOrgData;
  }

  // Заполнение комментария
  var commentTextareaForm = document.querySelector(".place-order__wr-comment-textarea");
  console.log('commentTextareaForm',commentTextareaForm);
  
  if (commentTextareaForm) {
    orderData.comment = commentTextareaForm.querySelector("textarea").value;
  }
  // Заполнение товаров в заказе
  cartItems.forEach((item) => {
    const productId = item.dataset.productId;
    const quantityInput = item.querySelector('.product-quantity');
    if (productId && quantityInput) {
      orderData.items.push({
        product_id: productId,
        quantity: parseInt(quantityInput.value, 0),
      });
    }
  });
  

  // Отправка заказа на сервер
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
    credentials: 'include',
  };

  fetch('https://r18.coffee/api/order/create', requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Ошибка: ' + response.statusText);
      }
      return response.json();
    })
    .then((answer) => {
      if (answer.errors && answer.errors.length > 0) {
        console.error('Ошибки в заказе:', answer.errors);
        showModal('failed');
        return;
      }

      if (answer.url && typeof answer.url === 'string') {
        window.location.href = answer.url;
        return;
      }

      if (answer.status === 'success') {
        const orderNumber = answer.data.match(/Номер заказа: (\d+)/);
        showModal('order-successfully', orderNumber ? orderNumber[1] : '');
      } else {
        showModal('failed');
      }
    })
    .catch((error) => {
      console.error('Ошибка запроса:', error);
      showModal('failed');
    });
}

// Функция для показа модалки
async function showModal(type, orderNumber = '') {
  try {
    const modal = await apiModals.read(type);
    document.body.appendChild(modal);
    modal.style.display = 'block';

    if (type === 'order-successfully' && orderNumber) {
      const orderNumberElement = modal.querySelector('.modal-order-success__number');
      if (orderNumberElement) {
        orderNumberElement.textContent = `№ ${orderNumber}`;
      }
    }

    const closeButton = modal.querySelector('.modal__close_failed');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        modal.remove();
      });
    }
  } catch (error) {
    console.error('Ошибка при загрузке модалки:', error);
  }
}

// Инициализация кнопки отправки заказа
document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('#submit-order-button');
  if (submitButton) {
    submitButton.addEventListener('click', submitOrder);
  } else {
    console.error('Кнопка отправки заказа не найдена.');
  }
});



class ZipCodeInput {
  constructor(selector) {
    this.inputElement = document.querySelector(selector);

    if (!this.inputElement) {
      console.error(`Element with selector "${selector}" not found.`);
      return;
    }

    this.init();
  }

  init() {
  
    this.inputElement.addEventListener('input', (event) => {
      const value = this.inputElement.value;

 
      this.inputElement.value = value.replace(/\D/g, '');

 
      if (this.inputElement.value.length > 6) {
        this.inputElement.value = this.inputElement.value.slice(0, 6);
      }
    });

 
    this.inputElement.addEventListener('blur', () => {
      if (this.inputElement.value.length < 6) {
        this.inputElement.value = ''; 
        showCustomAlert('Поле должно содержать только цифр');
      }
    });
  }
}


new ZipCodeInput('input[name="zip-code"]');
new ZipCodeInput('input[name="zip"]');

class Onlynumber {
  constructor(selector) {
    this.inputElement = document.querySelector(selector);

    if (!this.inputElement) {
      console.error(`Element with selector "${selector}" not found.`);
      return;
    }

    this.init();
  }

  init() {
  
    this.inputElement.addEventListener('input', (event) => {
      const value = this.inputElement.value;

 
      this.inputElement.value = value.replace(/\D/g, '');

 
      if (this.inputElement.value.length > 12) {
        this.inputElement.value = this.inputElement.value.slice(0, 12);
      }
    });

 
    this.inputElement.addEventListener('blur', () => {
      if (this.inputElement.value.length < 12) {
        this.inputElement.value = ''; 
        showCustomAlert('ИНН должен содержать 12 цифр');
      }
    });
  }
}


new Onlynumber('input[name="inn"]');

class OnlynumberOgrn {
  constructor(selector) {
    this.inputElement = document.querySelector(selector);

    if (!this.inputElement) {
      console.error(`Element with selector "${selector}" not found.`);
      return;
    }

    this.init();
  }

  init() {
    this.inputElement.addEventListener('input', (event) => {
      let value = this.inputElement.value.replace(/\D/g, ''); 

      if (value.length > 0) {
        const firstDigit = value.charAt(0);

        if (firstDigit === '1' || firstDigit === '5') {
          value = value.slice(0, 13); 
        } else if (firstDigit === '3') {
          value = value.slice(0, 15); 
        } else {
          showCustomAlert('Введите корректный номер');
          value = '';
        }
      }

      this.inputElement.value = value;
    });

    this.inputElement.addEventListener('blur', () => {
      const value = this.inputElement.value;
      if (value.length === 0) return; 

      const firstDigit = value.charAt(0);
      if ((firstDigit === '1' || firstDigit === '5') && value.length !== 13) {
        showCustomAlert('ОГРН должен содержать 13 цифр');
        this.inputElement.value = '';
      } else if (firstDigit === '3' && value.length !== 15) {
        showCustomAlert('ОГРНИП должен содержать 15 цифр');
        this.inputElement.value = '';
      }
    });
  }
}

new OnlynumberOgrn('input[name="ogrn"]');


const requiredInputs = document.querySelectorAll('.place-order__form-input_required');

// Для каждого инпута добавляем обработчик событий
requiredInputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.value.trim() === '') {
            // Добавляем класс, если поле пустое
            input.classList.add('place-order__form-input_required');
        } else {
            // Убираем класс, если есть текст
            input.classList.remove('place-order__form-input_required');
        }
    });
});



//Пример 
function addBusinessDays(startDate, daysToAdd) {
  const result = new Date(startDate);
  let addedDays = 0;
  
  while (addedDays < daysToAdd) {
    result.setDate(result.getDate() + 1);
    // Пропускаем субботу (6) и воскресенье (0)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return result;
}

function getDeliveryDate(dateString) {
  // Парсим дату из строки формата "05.03.2025 17:58:36"
  const [day, month, year] = dateString.split(' ')[0].split('.').map(Number);
  const orderDate = new Date(year, month - 1, day); // JS использует 0-индексированные месяцы

  // Добавляем 2 рабочих дня
  const deliveryDate = addBusinessDays(orderDate, 2);

  // Форматируем дату
  return deliveryDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}


//Обязательные чек боксы 
document.addEventListener('DOMContentLoaded', function() {
  const termsCheckbox = document.querySelector('input[name="terms"]');
  const newsletterCheckbox = document.querySelector('input[name="newsletter"]');
  const registerButton = document.querySelector('.modal-reg__button');

  function toggleRegisterButton() {
      registerButton.disabled = !(termsCheckbox.checked && newsletterCheckbox.checked);
  }

  termsCheckbox.addEventListener('change', toggleRegisterButton);
  newsletterCheckbox.addEventListener('change', toggleRegisterButton);
});