export default class ControllDelivery {
    constructor(d) {
        this.d = d;

        this.click = this.click.bind(this);
     }

    init() {
        this.d.init();
        this.registerEvents();
    }

    registerEvents() {
        this.d.controll.addEventListener('click', this.click)
    }

    click(e) {
        if(e.target.closest('.delivery__controll-item')) {
            const data = e.target.dataset.item;
            this.d.changeInfo(data);
        }
    }
}