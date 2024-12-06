export default class ApiModals {
    constructor() {

    }

    async read(type) {
        try {
            const response = await fetch(`../__modal-${type}.html`, {
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