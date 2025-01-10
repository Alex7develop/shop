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

    this.el
      .querySelector('.profile__address-list')
      .addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('profile__address-item')) {
          this.fillAddressForm(e.target.textContent);
          const event = new CustomEvent('addressSelected', {
            detail: e.target.textContent,
          });
          document.dispatchEvent(event);
        }
      });

    this.loadProfileData();
  }

  async loadProfileData() {
    try {
      const response = await fetch('http://localhost/api/auth/info', {
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
        decodeURIComponent(data.PATRONYMIC || 'Отчество');
      document.querySelector('input[name="phone"]').value =
        data.PERSONAL_PHONE || 'Телефон';
      document.querySelector('input[name="email"]').value =
        data.EMAIL || 'Электронная почта';

      // Пол
      const genderInputs = document.querySelectorAll('input[name="gender"]');
      if (data.PERSONAL_GENDER === 'man') {
        genderInputs[0].checked = true;
      } else if (data.PERSONAL_GENDER === 'woman') {
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
        addressList.innerHTML = data.ADDRESSES.map(
          (address) =>
            `<li class="profile__address-item">${decodeURIComponent(
              address.ALIAS
            )}</li>`
        ).join('');
      } else {
        addressList.innerHTML =
          '<li class="profile__address-item">Нет адресов</li>';
      }
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

    if (!data?.phone) {
      this.phone.value = 'Неверно указан номер телефона';
      this.phone.setAttribute('no-valid', '');
    }
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

    this.apiUrl = 'http://localhost/api/auth/updateprofile';
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
    const address = ADDRESSES.find((addr) => addr.NAME === event.detail);

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
  const addressManager = new AddressManager(
    'http://localhost/api/auth/createuseraddress'
  );
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
      address: data.Address || 'Не указан',
      price: data.Price || 0,
      state: data.State || 'Неизвестно',
      items: Array.isArray(data.Entities)
        ? data.Entities.map((entity) => {
            const product = entity.MAINS || {};
            return {
              name: product.NAME || 'Неизвестно',
              quantity: entity.BASKET_QUANTITY || 0,
              grind: product.PROPERTY_POMOL_VALUE || 'Не указано',
              roast: product.PROPERTY_OBJARKA_VALUE || 'Не указано',
              processing: product.PROPERTY_OBRABOTKA_VALUE || 'Не указано',
              variety: product.PROPERTY_SORT_VALUE || 'Не указано',
              weight: product.PROPERTY_VES_VALUE || 'Не указано',
              year: product.PROPERTY_YROJAI_VALUE || 'Не указано',
              image: (product.PROPERTY_PICTURES_VALUE_SRC || [])[0] || '',
            };
          })
        : [],
    };
  }

  renderOrders(orders) {
    // Очищаем контейнер перед добавлением заказов
    this.ordersContainer.innerHTML = '';

    // Создаем элементы для каждого заказа
    orders.forEach((order) => {
      const orderItem = document.createElement('li');
      orderItem.classList.add('history__item');

      orderItem.innerHTML = `
          <div class="history__delivery">${order.deliveryType}</div>
          <div class="history__delivery-cost">
            Итоговая сумма: <span class="history__delivery-cost_num">${
              order.price
            }</span>
            <span class="history__delivery-cost_currency">р.</span>
          </div>
          <div class="history__delivery-address">${order.address}</div>
          <div class="history__order-number">Заказ №: <span class="history__order-number_num">${
            order.id
          }</span></div>
          <ul class="history__details-list">
            ${order.items
              .map(
                (item) => `
              <li class="history__details-item">
                <div class="history__details-wr-img">
                  <img src="${item.image}" alt="фото заказанного товара">
                </div>
                <div class="history__details-description">
                  <p>${item.name}</p>
                  <p>Помол: ${item.grind}, Обжарка: ${item.roast}</p>
                  <p>Вес: ${item.weight}, Урожай: ${item.year}</p>
                </div>
                <div class="history__details-amount">
                  <span class="history__details-amount-num">${item.quantity}</span>
                  <span class="history__details-amount_unit">шт</span>
                </div>
              </li>
            `
              )
              .join('')}
          </ul>
        `;

      this.ordersContainer.appendChild(orderItem);
    });
  }

  renderError() {
    this.ordersContainer.innerHTML = `
        <div class="error-message">Не удалось загрузить заказы. Попробуйте позже.</div>
      `;
  }
}

// Пример использования
const orderList = new OrderList(
  'http://localhost/api/order/list',
  '.history__list'
);
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
      ).textContent =
        'Фамилия: ' + decodeURIComponent(data.LAST_NAME || 'Фамилия');
      document.querySelector(
        '.place-order__user-data-item:nth-child(2)'
      ).textContent = 'Имя: ' + decodeURIComponent(data.NAME || 'Имя');
      document.querySelector(
        '.place-order__user-data-item:nth-child(3)'
      ).textContent =
        'Отчество: ' + decodeURIComponent(data.PATRONYMIC || 'Отчество');
      document.querySelector(
        '.place-order__user-data-item:nth-child(4)'
      ).textContent = 'Телефон: ' + (data.PERSONAL_PHONE || 'Телефон');
      document.querySelector(
        '.place-order__user-data-item:nth-child(5)'
      ).textContent = 'Почта: ' + (data.EMAIL || 'Электронная почта');
    } catch (error) {
      console.error('Не удалось загрузить данные профиля:', error);
    }
  }
}

const userProfile = new UserProfile('http://localhost/api/auth/info');
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
      '.place-order__type-address-title'
    );

    this.init();
  }

  async init() {
    await this.loadAddresses();
    this.initEventListeners();
  }

  async loadAddresses() {
    try {
      const response = await fetch('http://localhost/api/auth/info', {
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
    const addressItems = addresses
      .map(
        (address) =>
          `<div class="place-order__type-address-item">${decodeURIComponent(
            address.ALIAS
          )}</div>`
      )
      .join('');
    this.addressList.innerHTML = addressItems;
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
//         let response = await fetch('http://localhost/api/order/delivery_and_payment', {
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
  'http://localhost/api/order/delivery_and_payment'
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

//Заказ Оформление
function submitOrder() {
  const orderData = {
    delivery_id: '11',
    address: {},
    oplata: '3',
    ur_litso: false,
    comment: '',
  };

  const addressForm = document.querySelector('.place-order__form-address');
  if (addressForm) {
    const formData = new FormData(addressForm);
    orderData.address = {
      alias: formData.get('alias') || 'Адрес по умолчанию',
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

  const deliveryType = document.querySelector(
    '.place-order__receiving-item_active'
  );
  if (deliveryType && deliveryType.dataset.receiving) {
    const delivery_type = deliveryType.dataset.receiving;
    if (delivery_type === 'pickup') {
      orderData.delivery_id = 6;
    }
    if (delivery_type === 'moskow') {
      orderData.delivery_id = 7;
    }
    if (delivery_type === 'moskow-area') {
      orderData.delivery_id = 8;
    }
    if (delivery_type === 'regions') {
      orderData.delivery_id = 9;
    }
    if (delivery_type === 'cdek') {
      orderData.delivery_id = 10;
    }
  }

  const paymentInput = document.querySelector(
    '.place-order__payment-type_active'
  );
  if (paymentInput && paymentInput.dataset.payment_type) {
    const paymentType = paymentInput.dataset.payment_type;
    if (paymentType === 'cash') {
      orderData.oplata = 3;
    }
    if (paymentType === 'card-site') {
      orderData.oplata = 4;
    }
    if (paymentType === 'card-place') {
      orderData.oplata = 5;
    }
    if (paymentType === 'legal') {
      orderData.oplata = 6;
    }
  }

  const legalCheckbox = document.querySelector('#legal-entity-checkbox');
  if (legalCheckbox) {
    orderData.ur_litso = legalCheckbox.checked;
  }

  const commentInput = document.querySelector('#order-comment');
  if (commentInput) {
    orderData.comment = commentInput.value;
  }

  const cartItems = document.querySelectorAll('.place-order__order-item');
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

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
    credentials: 'include',
  };

  fetch('http://localhost/api/order/create', requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Ошибка отлетела ' + response.statusText);
      }
      return response.json();
    })
    .then((answer) => {
      console.log('Success:', answer);

      let hasErrors = false;
      if (answer.errors && answer.errors.length > 0) {
        hasErrors = true;
        // ошибка, выводим список ошибок
      }

      if (!hasErrors && answer.status === 'success') {
        const dataType = typeof answer.data;
        if (dataType === 'string') {
          if (answer.data.indexOf('Номер заказа:') === -1) {
            console.error("'Номер заказа:' не получили");
          }
          if (answer.data.indexOf('Номер заказа:') !== -1) {
            console.info("'Номер заказа:' получили");
          }
          alert('Заказ успешно оформлен!');
        }
        if (dataType === 'object') {   
            console.info("пришёл объект, возможно содержащий ссылку");         
        }
      }
      
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Произошла ошибка при оформлении заказа.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.querySelector('#submit-order-button');
  if (submitButton) {
    submitButton.addEventListener('click', submitOrder);
  } else {
    console.error('ОТСУТСТВУЕТ :(');
  }
});
