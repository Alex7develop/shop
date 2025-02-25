import { API_URL } from '../utils/constants';

export default class ApiAccountButton {
  async create(data) {
    // Преобразование данных FormData в JSON
    const jsonData = {
      name: data.get('name'),
      last_name: data.get('surname'),
      patronymic: data.get('secodname'),
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
        const response = await fetch('https://dev.r18.coffee/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        });

        console.log('Ответ от сервера:', response);

        const result = await response.json();
        console.log('result=====>',result);
        
        if (result.TYPE != "ERROR") {
            console.log('Вход:', result);
            return result;
        } else {
  
            console.log('Ошибка от сервера:', result);

            // Прямо вызываем функцию отображения ошибки
            const errorMessage = result.MESSAGE.replace(/<br>/g, ''); // Убираем теги <br>
            console.log('Вызов showErrorMessage с текстом:', errorMessage);
            this.showErrorMessage(errorMessage); // Прямо здесь вызываем функцию

            return false;
        }
    } catch (result) {
        console.error('Ошибка сети или сервера:', result);
        this.showErrorMessage('Ошибка соединения');
        return false;
    }
}

showErrorMessage(message) {
  console.log('showErrorMessage вызван с текстом:', message); 

  let passwordInput = document.querySelector('input[name="password"]');
  if (!passwordInput) {
      console.error('Поле ввода пароля не найдено');
      return;
  }

  let inputWrapper = passwordInput.closest('.modal__wr-input'); 
  if (!inputWrapper) {
      console.error('Родительский контейнер .modal__wr-input не найден');
      return;
  }

  let errorBox = inputWrapper.querySelector('.login-error');

  if (!errorBox) {
      console.log('Создание нового блока ошибки');
      errorBox = document.createElement('div');
      errorBox.classList.add('login-error');
      errorBox.style.color = '#d9534f';
      errorBox.style.fontSize = '12px';
      errorBox.style.marginTop = '5px';
      errorBox.style.fontFamily = "'SofiaSans', sans-serif";
      errorBox.style.textAlign = 'left';

      inputWrapper.appendChild(errorBox);
  }

  // Устанавливаем текст ошибки
  errorBox.textContent = message;

  // Если сообщение уже есть, не дублируем его
  if (!inputWrapper.contains(errorBox)) {
      inputWrapper.appendChild(errorBox);
  }

  console.log('Сообщение об ошибке добавлено:', message);

  // Удалим сообщение через 3 секунды
  setTimeout(() => {
      if (errorBox) {
          errorBox.remove();
          console.log('Сообщение об ошибке удалено');
      }
  }, 3000);
}

  async logout() {
    try {
      const response = await fetch('https://dev.r18.coffee/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('response.ok:');
      console.log(response);

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
      window.location.href = '/';
    } else {
      alert('Произошла ошибка при выходе.');
    }
  }

  const logoutButton = document.querySelector('.profile__logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
});
document.addEventListener('DOMContentLoaded', function () {
  const apiAccountButton = new ApiAccountButton();

  async function handleLogout() {
    const result = await apiAccountButton.logout();
    console.log('Result', result);
    if (result) {
      window.location.href = '/';
    } else {
      alert('Произошла ошибка при выходе.');
    }
  }

  const logoutButton = document.querySelector('.profile__logout-button_exchange');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const orderButton = document.querySelector(".basket__button");

  if (orderButton) {
    orderButton.addEventListener("click", async (event) => {
      event.preventDefault(); // предотвращаем стандартный переход по ссылке

      try {
        const response = await fetch("https://dev.r18.coffee/api/auth/info", {
          method: "GET",
          credentials: "include", // чтобы отправлять куки сессии
        });

        const data = await response.json();
        console.log("Ответ API:", data); // Посмотрим, что приходит от API

        // Проверяем, есть ли в ответе ключевые данные, указывающие на авторизованного пользователя
        const isAuthenticated = data.EMAIL && data.LOGIN;

        if (response.ok && isAuthenticated) {
          window.location.href = "./place-an-order.html";
        } else {
          window.location.href = "./error-send-order.html";
        }
      } catch (error) {
        console.error("Ошибка при проверке авторизации:", error);
        window.location.href = "./error-send-order.html";
      }
    });
  }
  
});

