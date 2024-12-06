export default class RedrawNav {
    constructor(el, filter, data) {
        this.el = el;
        this.filterClass = filter;
        this.data = data;
        this.filter = null;

        this.itemsNav = [...this.el.querySelectorAll('.nav__item')];
        this.subMenu = this.el.querySelector('.nav__sub-menu');
        this.subList = this.el.querySelector('.nav__sub-menu-coffee-list');

        this.navCoffee = null;

        this.itemsPoints = [];
        
        this.subActive = false;

        this.duration = 0.15;
        this.tF = 'linear';
    }

    initNav() {
        // проверка находимся на главной или нет
        const isIndex = /.*\/{1}(index.html)?$/.test(window.location.pathname);

        // получаем часть пути страницы на которой находимся
        const page = window.location.pathname.replace(/(.*)(\/.*\.html)$/, '$2');
        
        // подсвечиваем в навигации пункт страницы на которой находимся
        this.itemsNav.forEach(item => {
            if(item.children[0].href.includes(page) && !isIndex) {
                item.classList.add('nav__item_active-page');
            }
        });

        // ПО THIS.DATA мы понимаем что это верхнее меню  
        // устанавливаем пункты подменю
        if(this.data) {
            const p = //.replace(location.pathname)

            this.navCoffee = this.itemsNav.find(item => item.dataset.item === 'coffee');

            let mapData = new Map();
            this.data.forEach(item => {
                mapData.set(item.packing, item['filter-name'])
            });

            mapData.forEach((key, val) => {
                const el = this.createEl('li', ['nav__sub-menu-coffee-item']);
                el.dataset.type = val;

                const a = this.createEl('a', ['nav__sub-menu-coffee-link'])
                a.href = './index.html';
                a.textContent = key;

                el.append(a);
                this.subList.append(el);
            })

            // позиционируем подменю по низу хедера и устанавливаем анимацию
            const header = this.el.parentElement.parentElement;
            const bH = header.getBoundingClientRect().bottom;
            const left = this.navCoffee.getBoundingClientRect().left;
            this.subMenu.style.top = `${bH / innerWidth * 100}vw`;
            this.subMenu.style.left = `${left / innerWidth * 100}vw`;
            this.subMenu.style.transition = `
                opacity ${this.duration}s ${this.tF},
                background ${this.duration}s ${this.tF}
            `
        }

        

        // ищем фильтр и блоки к которым будет прокрутка только
        // на главной
        if(isIndex) {
            if(this.filterClass && typeof this.filterClass === 'string') {
                const filterList = document.querySelector(this.filterClass);
                this.filter = filterList.querySelectorAll('.sl-prod__filter-type');
            }
    
    
            // собираем блоки к которым будем прокручивать страницу
            this.itemsNav.forEach(item => {
                const flag = item.dataset.item
                const el = document.querySelector(`.${flag}`);
                if(el) this.itemsPoints.push(el);
            })

            // ПРОВЕРЯЕМ localStorage
            if(localStorage?.point && innerWidth > 991) {
                // если фильтр есть то goToPointWithFilter
                if(localStorage?.filter) {
                    this.goToPointWithFilter(localStorage.filter);
                    delete localStorage.filter;
                    delete localStorage.point;
                    return;
                }
                // или фильтра нет то goToPoint
                this.scrolling(localStorage?.point);
                delete localStorage.point;
            }
        }
    }

    goToPoint(type) { 
        // console.log(type)
        // наличие data говорит о том что это верхнее меню
        if((this.data && type !== 'coffee') || !this.data) {
            this.scrolling(type);
        }
    }

    goToPointWithFilter(type) {
        // для верхнего меню
        if(this.data) {
            this.scrolling('coffee')
        }

        const filterButton = [...this.filter].find(item => item.dataset.id === type);
        filterButton.click()
    }

    scrolling(type) {
        const el = this.itemsPoints.find(item => item.matches(`.${type}`));

        if(el) {
            el.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest"
            })  
        }   
    }

    openSubMenu() {
        if(this.data && !this.subActive) {
            this.subActive = true;

            this.subMenu.classList.add('nav__sub-menu_active');
            // при открытом подменю меняем цвет элемента меню
            this.navCoffee.style.background = '#F1551C';
    
            setTimeout(() => {
                document.addEventListener('click', (e) => {
                    if(!e.target.closest('.nav__sub-menu-coffee-item')) {
                        this.closeSubMenu();
                    }
                }, {once: true})
            }, 3)
        }
    }

    closeSubMenu(e) {
        if(this.data && this.subActive) {
            this.subActive = false;

            this.navCoffee.style.background = '';

            this.subMenu.classList.remove('nav__sub-menu_active');
        }
    }

    createEl(el, arrClassName) {
        const element = document.createElement(el);

        arrClassName.forEach(c => element.classList.add(c));
        
        return element;
    }
}