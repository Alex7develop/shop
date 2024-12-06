export default class Filter {
    constructor(filter) {
        this.filter = filter;
        
        this.createEl = null;

        this.currentActive = null;
    }

    initial(arr) {
        this.rendering(arr);
    }

    // отрисовка кнопок фильтра, исходит из того какие упаковки есть 
    rendering(data) {
        const arr = Array.from(data.entries());

        for(let i = arr.length - 1 ; i >= 0; i -= 1) {
            const li = document.createElement('li');
            li.classList.add('sl-prod__filter-item');
            li.classList.add('sl-prod__filter-type');
            li.dataset.id = arr[i][0];
            li.textContent = arr[i][1];
    
            this.filter.prepend(li);
        }

        if(innerWidth <= 1200) {
            this.filter.parentElement.parentElement.prepend(this.filter)
        }
    }

    setActive(el, rendering) {
        if(this.currentActive) {
            this.currentActive.classList.remove('sl-prod__filter_active');
        }

        this.currentActive = el;
        this.currentActive.classList.add('sl-prod__filter_active');

        rendering(el.dataset.id);
    }

    resetActive(rendering) {
        if(this.currentActive)
            this.currentActive.classList.remove('sl-prod__filter_active');
            
        rendering('reset');
    }
}