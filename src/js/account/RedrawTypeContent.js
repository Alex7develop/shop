// ПЕРЕКЛЮЧЕНИЕ КОНТЕНТА В АККАУНТ ПО ЭЛЕМЕНТАМ МЕНЮ
export default class RedrawTypeContent {
    constructor(el) {
        this.el = el;

        this.nav = {
            profile : this.el.querySelector('[data-type_acc="profile"]'),
            history : this.el.querySelector('[data-type_acc="history"]'),
            loyalty : this.el.querySelector('[data-type_acc="history"]'),
            delivery : this.el.querySelector('[data-type_acc="delivery"]'),
        }

        this.content = {
            profile : this.el.querySelector('[data-account="profile"]'),
            history : this.el.querySelector('[data-account="history"]'),
            delivery : this.el.querySelector('[data-account="delivery"]'),
        }

        this.lastActiveNav = this.nav.profile;
        this.lastActiveContent = this.content.profile;
    }

    changeContent(type) {
        if(type) {
            this.lastActiveNav.classList.remove('account__tabs-item_active');
            this.lastActiveContent.classList.remove('account__content-item_active');

            this.nav[type].classList.add('account__tabs-item_active');
            this.content[type].classList.add('account__content-item_active');

            this.lastActiveNav = this.nav[type];
            this.lastActiveContent = this.content[type];
        }
    }
}