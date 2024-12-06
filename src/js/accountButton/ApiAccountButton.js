export default class ApiAccountButton {
    async create(data) {
        // Преобразование данных FormData в JSON
        const jsonData = {
            name: data.get("name"),
            last_name: data.get("surname"),
            password: data.get("password"),
            email: data.get("email"),
            phone: data.get("phone").replace(/\D/g, "").replace(/^(\d)/, '+$1'), 
        };

        try {
            const response = await fetch('https://dev.r18.coffee/api/auth/registration', {
                method: 'POST',
                credentials:'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData), 
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Успешная регистрация:", result);
                return result;
            } else {
                const error = await response.json();
                console.error("Ошибка регистрации:", error);
                return false;
            }
        } catch (error) {
            console.error("Ошибка запроса:", error);
            return false;
        }
    }



    async login(data) {
        const jsonData = {
            phone: data.phone,  
            password: data.password  
        };

        try {
            const response = await fetch('http://localhost/api/auth/login', {
                method: 'POST',
                "credentials": "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData), 
                
            });
            

            if (response.ok) {
                const result = await response.json();
                console.log("Успешный вход:", result);
                return result;
            } else {
                const error = await response.json();
                console.error("Ошибка входа:", error);
                return false;
            }
        } catch (error) {
            console.error("Ошибка запроса:", error);
            return false;
        }
    }
}
