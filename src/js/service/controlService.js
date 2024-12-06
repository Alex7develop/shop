export default class ControlService {
    constructor(d) {
        this.d = d;

        this.click = this.click.bind(this);
    }

    init() {
        this.registerEvents();
        this.d.initService();
    }

    registerEvents() {
        this.d.control.addEventListener('click', this.click);
    }

    click(e) {
        if(e.target.closest('.service__control-item')) {
            const index = e.target.dataset.index;
            this.d.changeActiveControl(index);
            this.d.changeCard(index);
        }
    }
}