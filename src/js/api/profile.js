export default class Profile {
  constructor() {
    this.data = null;
    this.accountElement = document.querySelector('.header__account a');
    this.basketUrl = 'https://dev.r18.coffee/basket';
    this.accountUrl = 'https://dev.r18.coffee/account';
  }

  async getUserInfo() {
    try {
      const response = await fetch('https://dev.r18.coffee/api/auth/info', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки данных: ${response.statusText}`);
      }

      this.data = await response.json();
    } catch (err) {
      console.error("Ошибка авторизации:", err);
      this.data = null; // Если ошибка, явно сбрасываем данные
    }

    return this.data;
  }

  updateUserIcon() {
    if (this.data && this.data.NAME && this.data.LAST_NAME) {
      const first = this.data.NAME[0].toUpperCase();
      const last = this.data.LAST_NAME[0].toUpperCase();
      this.accountElement.innerHTML = `${first} ${last}`;
    } else {
      this.accountElement.innerHTML = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 21 24' fill='none'>
          <path d='M10.5 0C6.45176 0 3.15 3.4304 3.15 7.63636C3.15 10.2656 4.44199 12.6009 6.39844 13.9773C2.65371 15.6477 0 19.5085 0 24H2.1C2.1 19.1676 5.84883 15.2727 10.5 15.2727C15.1512 15.2727 18.9 19.1676 18.9 24H21C21 19.5085 18.3463 15.6477 14.6016 13.9773C16.558 12.6009 17.85 10.2656 17.85 7.63636C17.85 3.4304 14.5482 0 10.5 0ZM10.5 2.18182C13.4121 2.18182 15.75 4.6108 15.75 7.63636C15.75 10.6619 13.4121 13.0909 10.5 13.0909C7.58789 13.0909 5.25 10.6619 5.25 7.63636C5.25 4.6108 7.58789 2.18182 10.5 2.18182Z' fill='white'/>
        </svg>
      `;
    }
  }

  restrictAccess() {
    const isBasketPage = window.location.href.startsWith(this.basketUrl);

    if (!this.data && isBasketPage) {
      this.accountElement.removeAttribute('href'); // Убираем ссылку
      this.accountElement.style.cursor = 'default'; // Меняем курсор
      this.accountElement.addEventListener('click', (event) => event.preventDefault());
    }
  }

  async init() {
    await this.getUserInfo();
    this.updateUserIcon();
    this.restrictAccess();
  }
}

const profile = new Profile();
profile.init();

