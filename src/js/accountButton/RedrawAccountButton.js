export default class RedrawAccountButton {
    constructor(el) {
        this.el = el;

        this.lastActiveModal = null;
    }

    
    openNewModal(modal) {
        if(this.lastActiveModal) this.lastActiveModal.remove();
        this.lastActiveModal = modal;
        
        document.body.append(modal);
    }
    
    closeModal(form) {
        this.lastActiveModal.remove();
        this.lastActiveModal = null;
    } 

    // текстовые поля пусты
    incorrectData(input, text) {
        if(input.type === 'password') input.type = 'text';
    
        input.value = text;
        input.style.color = '#FF7C7C';
        input.style.borderBottomColor = '#FF7C7C';
        input.dataset.invalid = 1;
    
        // при фокусе на поле возвращаем стандартный вид
        // если были изменения при вводе не валидных данных
        input.addEventListener('focus', () => {
            input.style.color = '#fff';
            input.style.borderBottomColor = '#FFF';
            input.value = '';
            input.dataset.invalid = '';
            if(input.name === 'password') input.type = 'password';
        }, { once : true })

        this.hideRequiredStar(input);
    }

    invalidCheckbox(checkbox) {
        checkbox.classList.add('modal__label-checkbox_invalid');

        checkbox.addEventListener('change', e => {
            e.target.classList.remove('modal__label-checkbox_invalid')
        }, {once : true});
    }

    // скрывает звездочку обозначающую обязательное поле
    hideRequiredStar(input) {
        if(input.classList.contains('modal__input_required')) {
            input.classList.remove('modal__input_required');
        }
    }
    // ставит звездочку обозначающую обязательное поле
    showRequiredStar(input) {
        if(!input.classList.contains('modal__input_required') && 
        !input.value) {
            input.classList.add('modal__input_required');
        }
    }  
}