export default class ControllNav {
    constructor(d) {
        this.d = d;

        this.click = this.click.bind(this);
    }

    init() {
        this.registerEvents();
        this.d.initNav();
        const loc = window.location.pathname;
    }
 
    registerEvents() {
        this.d.el.addEventListener('click', this.click);
    }

    click(e) { 
        e.preventDefault();
        // проверка находимся на главной или нет
        const isIndexPage = /.*\/{1}(index.html)?$/.test(window.location.pathname);

        if(e.target.closest('.nav__item')) {
            const el = e.target.closest('.nav__item');
            const flag = el.dataset.item;
            const path = e.target.closest('a')?.pathname;
            const isIndexPath = /.*\/{1}(index.html)?$/.test(path);

            // находимся не на главной, клик по элементу 
            // для прокрутки, и нет данных для подменю значит нижняя навигация
            // ИЛИ данные есть (значит верхняя но только не кофе)
            if((!isIndexPage && isIndexPath && !this.d.data ) ||
            (!isIndexPage && isIndexPath && this.d.data && flag !== 'coffee')) {
                // редирект, localstorage и прокрутка
                localStorage.point = flag;
                window.location = path;
            }

            // находимся на главной и путь главная
            // (значит клик по элементу после которого должна быть прокрутка)
            // просто прокручиваем, внутри метода есть условия что клик не по кофе
            // для подменю и работы с ним есть отдельный метод с функцией включения фильтра
            if(isIndexPage && isIndexPath) {
                this.d.goToPoint(flag);
            }

            // значит клик по элементу со ссылкой на другую страницу
            if(!isIndexPath) {
                window.location = path;
            }
        }

        // ----- ПОДМЕНЮ

        if(e.target.closest('[data-item="coffee"]')) {
            this.d.openSubMenu();
        }

        // клик по подменю или на главной и прокручиваем
        // или не на главной сохраняем данные и редиректим
        if(e.target.closest('.nav__sub-menu-coffee-item')) {
            const el = e.target.closest('.nav__sub-menu-coffee-item')
            const type = el.dataset.type;
            const path = el.children[0].pathname;
            console.log(path)
            if(isIndexPage) {
                this.d.goToPointWithFilter(type);
                return;
            }
            
            localStorage.filter = type;
            localStorage.point = 'coffee';
            window.location = path;
        }
    }
}