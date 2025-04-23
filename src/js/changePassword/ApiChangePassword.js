export default class ApiChangePassword {
    constructor() {}

    async create(data) {
        try {
            const response = await fetch('https://r18.coffee/api/auth/approverecoverpass', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.status === 200) {
                this.showSuccessModal('Успешно сменили пароль!');

                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);

                return;
            }

            throw new Error(result.MESSAGE || 'Ошибка при попытке смены пароля');
        } catch (error) {
            throw new Error('Ошибка попытки смены пароля ---- ' + error.message);
        }
    }

    showSuccessModal(message) {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-modal-wrapper';

        const modal = document.createElement('div');
        modal.className = 'custom-modal';

        const text = document.createElement('div');
        text.className = 'custom-modal__text';
        text.innerText = message;

        const button = document.createElement('button');
        button.className = 'custom-modal__close-button';
        button.innerText = 'Закрыть';
        button.onclick = () => {
            wrapper.remove();
        };

        modal.appendChild(text);
        modal.appendChild(button);
        wrapper.appendChild(modal);
        document.body.appendChild(wrapper);
    }
}
