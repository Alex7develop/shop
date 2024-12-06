export default class RedrawChangePassword {
    constructor(el) {
        this.el = el;

        this.form = this.el.querySelector('.change-pass__form');
        this.inputs = this.el.querySelectorAll('input');

        this.lastPlaceholder = null;
        this.lastValue = null;
    }

    // чистит поле для ввода
    clearInput(input, hasValue) {
        // в случае если поле установлено как не заполненное
        // удалить атрибут не заполненности
        if(input.hasAttribute('no-input-data')) {
            input.removeAttribute('no-input-data');
            input.type = 'password';
        }

        this.lastPlaceholder = input.placeholder;
        input.placeholder = '';

        if(hasValue) {
            this.lastValue = input.value;
        };

        input.value = '';
    }

    // заполняет поле для ввода
    fillInput(input, hasValue) {
        input.placeholder = this.lastPlaceholder;

        // есть сохраненное значение, но нет нового
        if(!hasValue && this.lastValue) {
            input.value = this.lastValue;
        };

        // если в this.lastValue - "Поле обязательно для заполнения" и нет нового значения
        // вызвать noInputData(input)
        if(!hasValue && this.lastValue === "Поле обязательно для заполнения") this.noInputData(input);

        this.lastValue = null;
    }

    // поле не заполнено
    noInputData(input) {
        input.type = 'text';
        input.value = "Поле обязательно для заполнения";
        input.setAttribute('no-input-data', '');
    }
}