import { API_URL } from '../utils/constants';

export default class ApiAccountButton {
  async create(data) {
    // Преобразование данных FormData в JSON
    const jsonData = {
      name: data.get('name'),
      last_name: data.get('surname'),
      password: data.get('password'),
      email: data.get('email'),
      phone: data.get('phone').replace(/\D/g, '').replace(/^(\d)/, '+$1'),
    };

    try {
      const response = await fetch(`${API_URL}/api/auth/registration`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        const result = await response.json();
        // console.log('Успешная регистрация:', result);
        return result;
      } else {
        const error = await response.json();
        // console.error('Ошибка регистрации:', error);
        return false;
      }
    } catch (error) {
      // console.error('Ошибка запроса:', error);
      return false;
    }
  }

  async login(data) {
    const jsonData = {
      phone: data.phone,
      password: data.password,
    };

    try {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        const result = await response.json();
        // console.log('Успешный вход:', result);
        return result;
      } else {
        const error = await response.json();
        // console.error('Ошибка входа:', error);
        return false;
      }
    } catch (error) {
      // console.error('Ошибка запроса:', error);
      return false;
    }
  }

  async logout() {
    try {
      const response = await fetch('http://localhost/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('response.ok:');
      console.log(response)

      if (response.ok) {
        // const result = await response.json();
        // console.log('Успешный выход:', result);
        // return result;
        return response;
      } else {
        const error = await response.json();
        console.error('Ошибка выхода:', error);
        return false;
      }
    } catch (error) {
      console.error('Ошибка запроса:', error);
      return false;
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const apiAccountButton = new ApiAccountButton();

  async function handleLogout() {
    const result = await apiAccountButton.logout();
    console.log('Result', result);
    if (result) {
      window.location.href = '/index.html';
    } else {
      alert('Произошла ошибка при выходе.');
    }
  }

  const logoutButton = document.querySelector('.profile__logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
});
