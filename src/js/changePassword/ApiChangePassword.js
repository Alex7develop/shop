export default class ApiChangePassword {
    constructor() {

    }

    async create(data) {
        try {
            const response = await fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(data)
            })


        } catch (error) {
            throw new Error('Ошибка попытки смены пароля' + '----' + error);
        }
    }
}