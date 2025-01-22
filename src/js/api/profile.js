export default class Profile {
  constructor() {
    this.data = null;
    this.accountElement = document.querySelector('.header__account a');
  }

  async getUserInfo() {
    let response, data;
    try {
      response = await fetch('http://localhost/api/auth/info', {
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
    } catch (err) {}

    if (this.data) return this.data;
    else return null;
  }

  updateUserIcon() {
    let first, last;
    const { NAME, LAST_NAME } = this.data;
    if (this.data) {
      first = NAME && typeof NAME === 'string' ? NAME[0].toUpperCase() : '';
      last =
        LAST_NAME && typeof LAST_NAME === 'string'
          ? LAST_NAME[0].toUpperCase()
          : '';
    }
    this.accountElement.innerHTML = `${first} ${last}`;
  }
}
