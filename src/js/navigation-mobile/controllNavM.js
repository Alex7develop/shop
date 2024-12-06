export default class ControllNavM {
    constructor(d) {
        this.d = d;

        this.click = this.click.bind(this);
    }

    init() {
        this.d.initNav(); 
        this.registerEvents();
    }

    registerEvents() {
        this.d.ctrl.addEventListener('click', this.click);
        this.d.nav.addEventListener('click', this.click);
    }
 
    click(e) {
        let path = null;
        const isIndex = /.*\/{1}(index.html)?$/.test(window.location.pathname);
        let isIndexPath = null;

        if(e.target.closest('a')) {
            path = e.target.closest('a').pathname;
            isIndexPath = /.*\/{1}(index.html)?$/.test(path);
        }

        if(isIndexPath) {
            e.preventDefault();
        }

        // открываем или закрываем меню
        if(e.target.closest('.nav-mob__control-list')) {
            // открываем меню 
            this.d.redrawNav();

            // меняем иконку бургера
            const el = e.target.closest('.nav-mob__control-item');
            const type = el.dataset.type;
            this.d.redrawCtrl(type);
        }

        if(e.target.closest('.nav-mob__item')) {
            const el = e.target.closest('.nav-mob__item');
            const type = el.dataset.item;

            // открываем подменю кофе
            if(type === 'coffee') {
                this.d.redrawNavSub();
                return;
            }

            // если страница не главная, для всех пунктов которые ведут к поинтам на главной
            // кроме кофе
            if(!isIndex && isIndexPath) {
                this.d.redirect(type, null, path)
                return;
            }

            // скролим
            this.d.goToPoint(type);
        }

        // клик по пункту из подменю кофе
        if(e.target.closest('.nav-mob__sub-menu-coffee-item')) {
            const el = e.target.closest('.nav-mob__sub-menu-coffee-item');
            const filter = el.dataset.id;

            if(!isIndex) {
                this.d.redirect('coffee', filter, path);
                return;
            }

            this.d.goToPoint('coffee', filter);
        }
    }
}