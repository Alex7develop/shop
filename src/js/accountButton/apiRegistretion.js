// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.querySelector('form[name="form_registration"]');
//   const registerButton = document.querySelector(".modal-reg__button");

//   // Обработчик клика по кнопке "Регистрация"
//   registerButton.addEventListener("click", async (event) => {
//       event.preventDefault(); // Остановить стандартное поведение кнопки

//       // Собрать данные из формы
//       const formData = new FormData(form);
//       const requestData = {
//           name: formData.get("name"),
//           last_name: formData.get("surname"),
//           password: formData.get("password"),
//           email: formData.get("email"),
//           phone: formData.get("phone"),
//       };

//       // Валидация полей
//       if (!validateForm(requestData)) {
//           alert("Пожалуйста, заполните все обязательные поля корректно.");
//           return;
//       }

//       try {
//           // Отправка POST-запроса
//           const response = await fetch("https://dev.r18.coffee/api/auth/registration", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(requestData),
//         });

//           const result = await response.json();

//           // Обработка ответа от сервера
//           if (response.ok && result.TYPE === "SUCCESS") {
//               alert(result.MESSAGE);
//               console.log("ID пользователя:", result.ID);
//               form.reset(); // Очистить форму после успешной регистрации
//           } else {
//               console.error("Ошибка:", result);
//               alert("Произошла ошибка: " + (result.MESSAGE || "Попробуйте снова."));
//           }
//       } catch (error) {
//           console.error("Ошибка при отправке данных:", error);
//           alert("Не удалось зарегистрироваться. Проверьте соединение с интернетом.");
//       }
//   });

//   // Функция валидации данных
//   function validateForm(data) {
//       const { name, last_name, password, email, phone } = data;
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       const phoneRegex = /^\+\d{10,15}$/;

//       return (
//           name &&
//           last_name &&
//           password.length >= 8 &&
//           /[A-Z]/.test(password) &&
//           /[a-z]/.test(password) &&
//           /\d/.test(password) &&
//           /[^A-Za-z0-9]/.test(password) &&
//           emailRegex.test(email) &&
//           phoneRegex.test(phone)
//       );
//   }
// });
