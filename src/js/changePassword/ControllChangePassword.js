import Encrypt from "../Encrypt/Encrypt.js";

export default class ControllChangePassword extends Encrypt {
    constructor(d, api, validation) {
        super();
        this.d = d;
        this.api = api;
        this.validation = validation;

        this.click = this.click.bind(this);
        this.focus = this.focus.bind(this);
        this.blur = this.blur.bind(this);
    }

    init() {
        this.registerEvents();
    }

    registerEvents() {
        this.d.el.addEventListener('click', this.click);

        [...this.d.inputs].forEach(input => {
            input.addEventListener('focus', this.focus);
            input.addEventListener('blur', this.blur);
        })
    }

    click(e) {
        if(e.target.closest('.change-pass__button')) {
            // проверяем на заполненность полей
            const isFill = [];
            [...this.d.inputs].forEach(input => {
                const result = this.validation.fillInput(input);

                // Поле не заполнено
                if(!result) {
                    this.d.noInputData(input);
                };
                isFill.push(result);
            })
            // останввливаем когда хоть одно поле пустое
            if(isFill.includes(false)) return;

            // проверяем на соответствие пароля шаблону
            const isPattern = this.validation.patternPass(this.d.form.pass);
            if(!isPattern) return;

            // проверка на совпадение
            const isSame = this.validation.isSamePass([...this.d.inputs]);
            if(!isSame) return


            // Подготовка объекта к отправке на сервер
            const url = decodeURIComponent(location.href);
            const index = url.indexOf('?') + 1;
            const queryData = url.slice(url.indexOf('?') + 1).split('&');

            const data = {
                USER_CHECKWORD: null,
                USER_LOGIN: null,
                pass: null,
                confirmed_pass: null,
            }; 

            queryData.forEach(item => {
                const arr = item.split('=');

                if(arr[0] === 'USER_CHECKWORD' || arr[0] === 'USER_LOGIN') {
                    data[arr[0]] = arr[1]
                }
            });

            const pass = this.d.form.pass.value;
            const confirmed_pass = this.d.form['repeat-pass'].value;
            console.log(pass);
            console.log(confirmed_pass);
            (async () => {
                data.pass = await super._encrypt(pass, data.USER_CHECKWORD);
                data.confirmed_pass = await super._encrypt(confirmed_pass, data.USER_CHECKWORD);
            })();

            this.api.create(data);
        }
    }

    focus(e) {
        const result = this.validation.fillInput(e.target);
        this.d.clearInput(e.target, result);
    }

    blur(e) {
        const result = this.validation.fillInput(e.target);
        this.d.fillInput(e.target, result);
    }

    
}