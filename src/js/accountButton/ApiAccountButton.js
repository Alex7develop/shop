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
    console.log('Найден ли input[name="password"]:', passwordInput); 

    if (!passwordInput) {
        console.error('Поле ввода пароля не найдено');
        return;
    }

    let parent = passwordInput.parentElement;
    console.log('Родительский элемент input:', parent);

    parent.style.position = 'relative'; 

    let errorBox = document.getElementById('login-error');

    if (!errorBox) {
        console.log('Создание нового блока ошибки');
        errorBox = document.createElement('div');
        errorBox.id = 'login-error';
        errorBox.style.position = 'absolute';
        errorBox.style.bottom = '-25px'; 
        errorBox.style.left = '50%';
        errorBox.style.transform = 'translateX(-50%)';
        errorBox.style.backgroundColor = '#ffdddd';
        errorBox.style.color = '#d9534f';
        errorBox.style.padding = '5px 10px';
        errorBox.style.borderRadius = '4px';
        errorBox.style.fontSize = '12px';
        errorBox.style.boxShadow = '0px 2px 5px rgba(0,0,0,0.2)';
        errorBox.style.transition = 'opacity 0.3s ease-in-out';
        errorBox.style.opacity = '0';
        errorBox.style.textAlign = 'center';
        errorBox.style.zIndex = '9999'; 
        errorBox.style.whiteSpace = 'nowrap';
        errorBox.style.fontFamily = "'SofiaSans', sans-serif";

        parent.appendChild(errorBox);
    }

    // Устанавливаем текст ошибки
    errorBox.textContent = message;

    // Убедимся, что сообщение видимо
    errorBox.style.opacity = '1';
    console.log('Сообщение об ошибке добавлено:', message); // Проверим, что ошибка добавляется

    // Удалим сообщение через 3 секунды
    setTimeout(() => {
        errorBox.style.opacity = '0';
        setTimeout(() => {
            console.log('Сообщение об ошибке удалено');
            errorBox.remove();
        }, 300);
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

