export default class RedrawDelivery {
    constructor(dellivery, classCtrl, classInfo) {
        this.dellivery = dellivery;
        this.classCtrl = classCtrl && typeof classCtrl === 'string' ? classCtrl : '';
        this.classInfo = classInfo && typeof classInfo === 'string' ? classInfo : '';

        this.controll = this.dellivery.querySelector('.delivery__controll');
        this.info = this.dellivery.querySelector('.delivery__wr-info');

        this.ctrlList = [...this.controll.querySelectorAll('.delivery__controll-item')];
        this.infoList = [...this.info.querySelectorAll('.delivery__direction')];

        this.lastActiveCtrl = null;
        this.lastActiveInfo = null;
    }

    init() {
        this.lastActiveCtrl = this.ctrlList[0];
        this.lastActiveInfo = this.infoList[0];

        this.lastActiveCtrl.classList.add(this.classCtrl);
        this.lastActiveInfo.classList.add(this.classInfo);
    }

    changeInfo(data) {
        this.lastActiveCtrl.classList.remove(this.classCtrl);
        this.lastActiveInfo.classList.remove(this.classInfo);

        this.lastActiveCtrl = this.ctrlList.find(item => item.dataset.item === data);
        this.lastActiveInfo = this.infoList.find(item => item.dataset.item === data);

        this.lastActiveCtrl.classList.add(this.classCtrl);
        this.lastActiveInfo.classList.add(this.classInfo);
    }
}