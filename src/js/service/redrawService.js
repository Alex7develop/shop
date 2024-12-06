export default class RedrawService {
    constructor(service) {
        this.service = service;
        this.control = this.service.children[0];
        this.cards = this.service.children[1];

        this.activeCard = null;
        this.activeControl = null;
        this.lastIndex = null;
    }

    initService() {
        this.activeCard = this.cards.children[0];
        this.activeControl = this.control.children[0];
        this.lastIndex = this.activeControl.dataset.index;
    }

    changeActiveControl(index) {
        if(this.lastIndex === index) return;
        this.activeControl.classList.remove('service__control-item_active');
        this.control.children[index].classList.add('service__control-item_active');
        this.activeControl = this.control.children[index];
    }

    changeCard(index) {
        if(this.lastIndex === index) return;
        console.log('work')
        this.activeCard.classList.remove('service__content-item_active');
        this.cards.children[index].classList.add('service__content-item_active');
        this.activeCard = this.cards.children[index];
        this.lastIndex = index;
    }
}