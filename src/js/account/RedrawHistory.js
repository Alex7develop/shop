export default class RedrawHistory {
    constructor(el) {
        this.el = el;

        this.detailsLists = this.el.querySelectorAll('.history__details-list');
    }

    initScroll() {
        [...this.detailsLists].forEach(item => {
            if(item.children.length > 5) {
                item.classList.add('account__add-scroll');
            }
        })
    }

    showHideDetails(el) {
        const state = +el.dataset.state;
        const box = el.previousElementSibling
        
        if(!state) {
            box.checked = true;
            el.dataset.state = 1;
            return;
        }

        box.checked = false;
        el.dataset.state = 0;
    }
}