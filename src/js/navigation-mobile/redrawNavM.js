export default class RedrawNavM {
    constructor(ctrl, nav, data) {
        this.ctrl = ctrl;
        this.nav = nav;
        this.data = data;

        this.items = this.nav.children; 

        this.ctrlOn = this.ctrl.querySelector('.nav-mob__control_turn-on');
        this.ctrlOff = this.ctrl.querySelector('.nav-mob__control_turn-off');
        this.filters = document.querySelectorAll('.sl-prod__filter-type');

        this.wrSub = this.nav.querySelector('.nav-mob__sub-item');
        this.wrSubItems = null;

        this.navState = false; // меню закрыто
        this.navSubState = false; // подменю закрыто

        this.handlerScroll = this.handlerScroll.bind(this);
    }

    initNav() {
        let mapData = new Map();
        this.data.forEach(item => {
            mapData.set(item.packing, item['filter-name'])
        });

        mapData.forEach((key, val) => {
            const li = this.createEl('li', ['nav-mob__sub-menu-coffee-item']);
            li.dataset.id = val;

            const a = this.createEl('a', ['nav-mob__sub-menu-coffee-link']);
            a.href = './index.html';
            a.textContent = key;

            li.append(a);
            this.wrSub.append(li);
        })

        this.wrSubItems = this.wrSub.children;


        // проверяем localStorage на случай срабатывания
        // метода redirect
        if(localStorage.length > 0) {
            if(localStorage.name === 'with-filter') {
                this.goToPoint(localStorage.point, localStorage.filter);
                delete localStorage.filter;
            } else if (localStorage.name === 'no-filter') {
                this.goToPoint(localStorage.point);
            }

            delete localStorage.name;
            delete localStorage.point;
        } 
    }

    // открыть закрыть навигацию
    redrawNav() {
        if(this.navState) {
            if(this.navSubState) {
                this.redrawNavSub();
            }

            this.nav.style.height = `${0}px`;
            this.navState = false;

            document.removeEventListener('scroll', this.handlerScroll);

            return;
        }

        const height = [...this.items].reduce((acc, item) => {
            return acc += Math.ceil(item.offsetHeight);
        }, 0)
        
        this.nav.style.height = `${height}px`;
        this.navState = true;

        document.addEventListener('scroll', this.handlerScroll)
    }

    // слушатель для события
    handlerScroll(e) {
        if(scrollY >= this.nav.offsetHeight) {  
            if(this.navSubState) {
                this.redrawNavSub();
            }

            this.redrawCtrl('off');
            this.redrawNav();
        }
    }

    // открыть закрыть подменю
    redrawNavSub() {
        const coffee = this.wrSub.previousElementSibling;

        // закрыть подменю к кофе
        if(this.navSubState) {
            // чтобы высота не была фиксированной и менялась с учетом подменю
            this.nav.style.height = `auto`;

            this.wrSub.style.height = `${0}px`;

            this.navSubState = false;

            coffee.classList.remove('nav-mob__sub-item_active');
 
            this.wrSub.addEventListener('transitionend', () => {
                // возвращаем фиксированную высоту
                const height = this.nav.offsetHeight;
                this.nav.style.height = `${height}px`;
            }, {once: true})

            return;
        }

        const height = [...this.wrSubItems].reduce((acc, item) => {
            return acc += item.offsetHeight;
        }, 0)

        // чтобы высота не была фиксированной и менялась с учетом подменю
        this.nav.style.height = `auto`;

        // подсвечиваем кофе при открытом подменю
        coffee.classList.add('nav-mob__sub-item_active');

        this.wrSub.style.height = `${height}px`;

        this.wrSub.addEventListener('transitionend', () => {
            const height = this.nav.offsetHeight;
            this.nav.style.height = `${height}px`;

            this.navSubState = true;
        }, {once: true})
    }

    // перерисовка иконки меню
    redrawCtrl(type) {
        if(type === 'on') {
            this.ctrlOn.classList.remove('nav-mob__control-item_active');
            this.ctrlOff.classList.add('nav-mob__control-item_active');
            return;
        }

        this.ctrlOff.classList.remove('nav-mob__control-item_active');
        this.ctrlOn.classList.add('nav-mob__control-item_active');
    }
 
    redirect(type, filter, path) {
        location = path;

        if(filter) {
            localStorage.name = 'with-filter';
            localStorage.point = type;
            localStorage.filter = filter;

            return;
        }

        localStorage.name = 'no-filter';
        localStorage.point = type;
    }

    goToPoint(type, filter) {
        if(!filter && type !== 'coffee') {
            this.scrollTo(type);
            return;
        }

        this.activateFilter(filter);
        this.scrollTo(type);
    }

    scrollTo(type) {
        // находим на странице элемент к которому будем прокручивать
        let el = null;

        if(type === 'contacts') {
            el = document.querySelector('.contacts')

            if(el) {
                el.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                    inline: "nearest"
                });
            }

            return;
        } else {
            el = document.querySelector(`.${type}`);
        }

        if(el) {
            el.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest"
            });
        }
    }

    activateFilter(filter) {
        const el = [...this.filters].find(item => item.dataset.id === filter);
        el.click();
        el.addEventListener('click', (e) => {console.log(e)}, {once:true})
    }

    createEl(el, arrClassName) {
        const element = document.createElement(el);

        arrClassName.forEach(c => element.classList.add(c));
        
        return element;
    }
}