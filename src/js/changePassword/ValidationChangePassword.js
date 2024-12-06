export default class ValidationChangePassword {
    constructor() {

    }

    /**
     * fill - запонение поля true/false
     * pattern - соответствие шаблону true/false
     * same - сравнение двух паролей true/false
     * 
     * data - одно значение или массив из 2х значений если параметр same true
     * */ 
    

    fillInput(input) {
        const value = input.value;
        return value ? true : false
    }

    patternPass(input) {
        // Пароль должен содержать не менее 8 символов не более 64 символов
        // Как минимум одна заглавная и одна строчная буква.
        // Должна быть как минимум 1 цифра.
        // Наличие следующих символов: ~ !?@#$%^&*_-  ----   \    regexp /[~!?@|+#()><\]{}$\[/%"^'&*.,_:-]+/g

        // массив результатов валидаций
        const result = [];

        // значения инпутов
        const value = input.value;
        const length = value.length;

        // проверка на длинну
        result.push(length >= 8 && length <= 64);

        // проверка на наличие как миинимум одной стройной и одной заглавной буквы
        result.push(/[a-z]+/g.test('dsFdc') && /[A-Z]+/g.test('dsFdc'));

        // проверка на наличие цифры
        const isNum = /\d+/ig.test(value);
        result.push(isNum);

        // проверка на наличие символа
        result.push(/[~!?@|+#()><\]{}$\[/%"^'&*.,_:-]+/g.test(value));

        return result.every(item => item);
    }

    isSamePass(inputs) {
        const set = new Set();

        inputs.forEach(input => set.add(input.value));

        return set.size === 1 || false;
    }
}