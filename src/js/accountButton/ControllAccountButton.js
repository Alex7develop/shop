import ApiModals from '../api-modals/ApiModals.js';

import { API_URL } from '../utils/constants.js';

export default class ControllAccountButton extends ApiModals {
  constructor(redraw, IMask, api) {
    super();
    this.redraw = redraw;
    this.IMask = IMask;
    this.api = api;

    this.mask = null;
    this.currentPlaceholder = null;

    this.click = this.click.bind(this);
    this.clickLogReg = this.clickLogReg.bind(this);
    this.clickLogin = this.clickLogin.bind(this);
    this.clickRecover = this.clickRecover.bind(this);
    this.clickRecoverSuccess = this.clickRecoverSuccess.bind(this);
    this.clickRegistration = this.clickRegistration.bind(this);
    this.clickConfirmCode = this.clickConfirmCode.bind(this);
    this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);

  }

  togglePasswordVisibility(passwordInput) {
    const currentType = passwordInput.type;
    passwordInput.type = currentType === 'password' ? 'text' : 'password';
    
    const eyeIcon = passwordInput.parentElement.querySelector('.eye-icon');
    if (eyeIcon) {
      eyeIcon.style.opacity = currentType === 'password' ? '0.5' : '1';
    }
  }

  init() {
    this.registerEvents();

    const path = location.pathname;
    if (path.includes('account')) {
      this.redraw.el.classList.add('header__account_active');
    }
  }

  togglePasswordVisibility(passwordInput) {
    const currentType = passwordInput.type;
    passwordInput.type = currentType === 'password' ? 'text' : 'password';
    
    const eyeIcon = passwordInput.parentElement.querySelector('.eye-icon');
    if (eyeIcon) {
      eyeIcon.style.opacity = currentType === 'password' ? '0.5' : '1';
    }
  }

  registerEvents() {
    this.redraw.el.addEventListener('click', this.click);
     document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('.password-toggle-btn');
      if (toggleBtn) {
        const wrapper = toggleBtn.closest('.password-input-wrapper');
        if (wrapper) {
          const passwordInput = wrapper.querySelector('input[type="password"], input[type="text"]');
          if (passwordInput) {
            this.togglePasswordVisibility(passwordInput);
          }
        }
      }
    });
  }

  // нажатие на КНОПКУ ACCOUNT в HEADER
  click(e) {
    // если пользователь незалогинин показываем модалку
    if (
      e.target.closest('.header__account a') &&
      e.target.closest('.header__account a').hash === '#0' &&
      !location.pathname.includes('account')
    ) {
        if (window.userInfo) {
            window.location.href = '/account.html';
        }
        // ---- pop-up ЛОГИН ИЛИ РЕГИСТРАЦИЯ
        else (async () => {
            const logRegPopUp = await super.read('log-reg');
            this.redraw.openNewModal(logRegPopUp);

            this.redraw.lastActiveModal.addEventListener('click', this.clickLogReg);
        })();
    }
  }

  // для событий клик по окну логин или регистрация
  clickLogReg(e) {
    // закрытие log-reg
    if (e.target.closest('.modal__close')) this.redraw.closeModal();

    // ---- pop-up ВХОД В АККАУНТ
    if (e.target.closest('.modal-log-reg__button_login')) {
      this.redraw.closeModal();

      (async () => {
        const loginPopUp = await super.read('login');
        this.redraw.openNewModal(loginPopUp);

        this.redraw.lastActiveModal.addEventListener('click', this.clickLogin);
        // удаление и установка input placeholder
        this.registerEventsInputsText(this.redraw.lastActiveModal);
      })();
    }

    // вызов pop-up РЕГИСТРАЦИЯ
    if (e.target.closest('.modal-log-reg__button_register')) {
      (async () => {
        const registrationPopUp = await super.read('registration');
        this.redraw.openNewModal(registrationPopUp);

        this.redraw.lastActiveModal.addEventListener(
          'click',
          this.clickRegistration
        );
        // удаление и установка input placeholder и маски на телефон
        this.registerEventsInputsText(this.redraw.lastActiveModal);

        // на телефон формы регистрации вешаем при фокусе маску
        // const form = this.redraw.lastActiveModal.querySelector('form');

        // form.phone.addEventListener('focus', (e) => {
        //     this.mask = new this.IMask(e.target, {
        //         mask: '+{7} (000) 000-00-00',
        //         lazy: false,
        //         placeholderChar: '_',
        //     })

        //     form.phone.addEventListener('blur', (e) => {
        //         const phone = e.target.value;
        //         const result = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(phone);
        //         if(!result) {
        //             this.mask.destroy();
        //             e.target.value = '';

        //             this.redraw.showRequiredStar(form.phone);
        //         };
        //     })
        // })
      })();
    }
  }

  async clickLogin(e) {
    const form = this.redraw.lastActiveModal.querySelector('form');

    // закрытие модалки вход в аккаунт
    if (e.target.closest('.modal__close')) this.redraw.closeModal(form);

    // вход в аккаунт
    if (e.target.closest('.modal-login__button')) {
      // валидация
      this.validation([form.phone, form.password]);

      // сбор данных и отправка на сервер (вывод в консоль)
      if (
        form.phone.value &&
        !+form.phone.dataset?.invalid &&
        form.password.value &&
        !+form.password.dataset?.invalid
      ) {
        const phone = form.phone.value
          .trim()
          .replace(/\D/g, '')
          .replace(/^(\d)/, '+$1'); // Преобразование телефона в формат с "+"
        const password = form.password.value.trim(); // Пароль

        const requestData = { phone, password };

        // Логируем данные для отправки на сервер
        // console.log('Данные для отправки на сервер:', requestData);

        // Отправка данных на сервер
        const result = await this.api.login(requestData);

        if (result === true) window.location.href = '/account.html';
      }
    }

    // открытие модалки восстановление пароля
    if (e.target.closest('.modal-login__recover')) {
      (async () => {
        const modalRecover = await super.read('recover');
        this.redraw.openNewModal(modalRecover);

        this.redraw.lastActiveModal.addEventListener(
          'click',
          this.clickRecover
        );
        // удаление и установка input placeholder
        this.registerEventsInputsText(this.redraw.lastActiveModal);
      })();
    }
  }

  // отправка запроса для восстановления пароля и закрытие модалки
  async clickRecover(e) {
    // форма из модалки
    const form = this.redraw.lastActiveModal.querySelector('form');

    // закрытие модалки восстановление
    if (e.target.closest('.modal__close')) this.redraw.closeModal(form);

    // отправка данных
    if (e.target.closest('.modal-recover__button')) {
      // валидация
      this.validation([form.phone]);

      if (form.phone.value && !+form.phone.dataset?.invalid) {
        const phone = form.phone.value.trim().replace(/\D/g, '');
        if (phone) {
          const requestData = { phone: `+${phone}` };

          try {
            const response = await fetch(
              `${API_URL}/api/auth/recovery`,
              // 'https://dev.r18.coffee/api/auth/recovery',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
              }
            );

            const result = await response.json();

            if (response.ok) {
              // console.log('Запрос на восстановление отправлен:', result);

              const modalRecover = await super.read('recover-success');
              this.redraw.openNewModal(modalRecover);
              this.redraw.lastActiveModal.addEventListener(
                'click',
                this.clickRecoverSuccess
              );

              this.registerEventsInputsText(this.redraw.lastActiveModal);
            } else {
              this.showErrorMessage('Что-то пошло не так. Попробуйте еще раз.');
            }
          } catch (error) {
            console.error('Ошибка запроса:', error);
            this.showErrorMessage('Что-то пошло не так. Попробуйте еще раз.');
          }
        }
      }
    }
  }

  showErrorMessage(message) {
    const form = this.redraw.lastActiveModal.querySelector('form');
    const p = document.createElement('p');
    p.style = `
        position: absolute;
        bottom: 0; 
        font-family: 'SofiaSans';
        font-size: 0.83vw;
        font-weight: 300;
        color: rgb(255, 124, 124);
        translate: 0 115%;
    `;
    p.textContent = message;

    const parent = form.parentElement;
    parent.style.position = 'relative';

    parent.append(p);

    setTimeout(() => {
      p.remove();
      parent.style.position = '';
    }, 7000);
  }

  clickRecoverSuccess(e) {
    const form = this.redraw.lastActiveModal.querySelector('form');

    if (e.target.closest('.modal__close')) this.redraw.closeModal(form);
  }

  // для событий по форме регистрации
  clickRegistration(e) {
    const form = this.redraw.lastActiveModal.querySelector('form');

    if (e.target.closest('.modal__close')) this.redraw.closeModal(form);

    if (e.target.closest('.modal-reg__button')) {
      const inputs = form.querySelectorAll('.modal__wr-input > input');

      const resultsValidation = [];
      resultsValidation.push(this.validation([...inputs]));
      resultsValidation.push(this.validationPatternEmail(form.email));
      resultsValidation.push(this.validationPatternPhone(form.phone));
      resultsValidation.push(this.validationCheckbox([form.confirm]));
      resultsValidation.push(this.validationPassword(form.password));
      resultsValidation.push(this.validatePasswordMatch(form.password, form['password_confirmation']));

      const totalResult = resultsValidation.some((item) => item.length > 0);

      if (totalResult) return;

      if (
        form.name.value &&
        !+form.name.dataset?.invalid &&
        form.phone.value &&
        !+form.phone.dataset?.invalid &&
        form.email.value &&
        !+form.email.dataset?.invalid &&
        form.password.value &&
        !+form.password.dataset?.invalid
      ) {
        // Сохраняем номер телефона перед отправкой
        this.savedPhoneNumber = form
          .querySelector('input[name="phone"]')
          ?.value.trim();
        // console.log('Сохранённый номер телефона:', this.savedPhoneNumber);

        const formData = new FormData(form);
        this.api.create(formData);

        (async () => {
          const confirmCodePopUp = await super.read('code');
          this.redraw.openNewModal(confirmCodePopUp);
          this.redraw.lastActiveModal.addEventListener(
            'click',
            this.clickConfirmCode
          );
          this.registerEventsInputsText(this.redraw.lastActiveModal);
        })();
      }
    }
  }

  clickConfirmCode(e) {
    const form = this.redraw.lastActiveModal.querySelector('form');

    if (e.target.closest('.modal__close')) {
      // Сохраняем номер телефона перед закрытием модального окна
      this.savedPhoneNumber = form
        .querySelector('input[name="phone"]')
        ?.value.trim();
      // console.log('Сохранённый номер телефона:', this.savedPhoneNumber);
      this.redraw.closeModal(form);
      return;
    }

    if (e.target.closest('.modal-code__button')) {
      const inputs = form.querySelectorAll('.modal__wr-input > input');

      const invalidFields = [...inputs].filter((input) => !input.value.trim());
      if (invalidFields.length) {
        alert('Заполните все обязательные поля.');
        return;
      }

      // Получаем номер телефона и код
      const phone =
        this.savedPhoneNumber ||
        form.querySelector('input[name="phone"]')?.value.trim();
      const formattedPhone = phone.replace(/[^\d+]/g, '');

      const code = form.querySelector('input[name="code"]')?.value.trim();
      // console.log('Номер телефона для отправки:', phone); // Лог номера телефона
      // console.log('Код подтверждения:', code); // Лог кода подтверждения

      if (!formattedPhone || !code) {
        alert('Отсутствуют обязательные данные (номер телефона или код).');
        return;
      }

      const requestData = { phone: formattedPhone, code };

      this.sendCodeToServer(requestData);
    }
  }

  async sendCodeToServer(data) {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/approvecoderegister`,
        // 'https://dev.r18.coffee/api/auth/approvecoderegister',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok || result.TYPE !== 'SUCCESS') {
        console.error('Ошибка подтверждения:', result);
        alert('Ошибка: ' + (result.MESSAGE || 'Попробуйте снова.'));
        return;
      }

      alert('Регистрация успешно завершена!');
      this.redraw.closeModal();
    } catch (error) {
      console.error('Ошибка при отправке данных:', error);
      alert('Не удалось подтвердить код. Проверьте соединение с интернетом.');
    }
  }

  // при фокусе поле очищается если нет value
  // при blur заполняется, если нет value
  registerEventsInputsText(modal) {
    const inputs = modal.querySelectorAll(
      'form input[type="text"], form input[type="email"], form input[type="password"]'
    );

    [...inputs].forEach((input) => {
      input.addEventListener('focus', (e) => {
        if (input.name === 'phone') this.addPhoneMask(input);

        this.currentPlaceholder = e.target.placeholder;
        e.target.removeAttribute('placeholder');
        this.redraw.hideRequiredStar(input);
      });
      input.addEventListener('blur', (e) => {
        if (input.name === 'phone') this.destroyPhoneMask(input);

        e.target.setAttribute('placeholder', this.currentPlaceholder);
        this.currentPlaceholder = null;
        this.redraw.showRequiredStar(input);
       // Добавляем проверку совпадения паролей при потере фокуса
       if (input.name === 'confirm-password') {
        const form = input.closest('form');
        if (form) {
          this.validatePasswordMatch(form.password, form['confirm-password']);
        }
      }
    });

    // Добавляем проверку при вводе для поля подтверждения пароля
    if (input.name === 'confirm-password') {
      input.addEventListener('input', (e) => {
        const form = input.closest('form');
        if (form && form.password.value) {
          if (input.value === form.password.value) {
            // Сбрасываем ошибку если пароли совпадают
            input.style.color = '#fff';
            input.removeAttribute('data-invalid');
          }
        }
      });
    }
    });
  }
  // добавляем к полю маску
  addPhoneMask(input) {
    this.mask = new this.IMask(input, {
      mask: '+{7} (000) 000-00-00',
      lazy: false,
      placeholderChar: '_',
    });
  }
  // удаляем с поля маску при нессответствии введенного шаблону
  destroyPhoneMask(input) {
    const phone = input.value;
    const result = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(phone);
    if (!result) {
      this.mask.destroy();
      input.value = '';

      this.redraw.showRequiredStar(input);
    }
  }

  // валидация заполненности полей
  validation(inputs) {
    const result = [];
    inputs.forEach((item) => {
      // поле не заполненно
      if (!item.value) {
        // валидация
        this.redraw.incorrectData(item, 'Поле обязательное для заполнения');
        result.push(false);
      }
    });

    return result;
  }
  // валидация чекбокса
  validationCheckbox(checkbox) {
    const result = [];
    checkbox.forEach((ch) => {
      if (!ch.checked) {
        this.redraw.invalidCheckbox(ch);
        result.push(false);
      }
    });

    return result;
  }
  // валидация на соответствие шаблону телефона
  validationPatternPhone(phone) {
    const totalResult = [];
    const result = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/gi.test(phone.value);
    if (!result) {
      this.redraw.incorrectData(phone, 'Некорректно введен номер');
      totalResult.push(false);
    }

    return totalResult;
  }
  // валидация на соответствие шаблону email
  validationPatternEmail(email) {
    const totalResult = [];
    const result = /^[A-Z0-9._%+-]+@[A-Z0-9-]+.+\.[A-Z]{2,4}$/i.test(
      email.value
    );
    if (!result) {
      this.redraw.incorrectData(email, 'Некорректно введена почта');
      totalResult.push(false);
    }

    return totalResult;
  }
  // валидация на соответствие шаблону password
  validationPassword(password) {
    // Пароль должен содержать не менее 8 символов не более 64 символов
    // Как минимум одна заглавная и одна строчная буква.
    // Должна быть как минимум 1 цифра.
    // Наличие следующих символов: ~ !?@#$%^&*_-  ----   \    regexp /[~!?@|+#()><\]{}$\[/%"^'&*.,_:-]+/g

    // массив результатов валидаций
    const result = [];
    // общий, итоговый (или пустой или в нем будет false)
    const totalResult = [];

    // значения инпутов
    const value = password.value;
    const length = value.length;

    // проверка на длинну
    result.push(length >= 8 && length <= 64);

    // проверка на наличие как миинимум одной стройной и одной заглавной буквы
    result.push(/[a-z]+/g.test('dsFdc') && /[A-Z]+/g.test('dsFdc'));

    // проверка на наличие цифры
    const isNum = /\d+/gi.test(value);
    result.push(isNum);

    // проверка на наличие символа
    result.push(/[~!?@|+#()><\]{}$\[/%"^'&*.,_:-]+/g.test(value));

    const total = result.every((item) => item);

    if (!total) {
      this.redraw.incorrectData(
        password,
        'Пароль не соответствует требованиям'
      );
      totalResult.push(total);
    }

    return totalResult;
  }

  validatePasswordMatch(password, confirmPassword) {
    const totalResult = [];
    
    if (password.value !== confirmPassword.value) {
      this.redraw.incorrectData(confirmPassword, 'Пароли не совпадают');
      totalResult.push(false);
    }
    return totalResult;
  }

}
