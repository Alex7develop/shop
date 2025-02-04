export default class ApiModals {
    constructor() {

    }

    async read(type) {
        try {
            const ApiUrl = `https://dev.r18.coffee/__modal-${type}`
            console.log(ApiUrl);
            const response = await fetch(ApiUrl, {
                headers: {
                    'Content-Type': 'text/html'
                }
            });

            const text = await response.text(); 
            
            const parser = new DOMParser();
            const html = parser.parseFromString(text, 'text/html');
            const modal = html.querySelector('.wrapper-modal');

            return modal;
        } catch (error) {
            throw new Error('') 
        }
    }
}