export default function buttonToTop(elements) {
    [...elements].forEach(el => {
        el.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth"
            })
        })
    })
    
    // проверка находимся на about-us или нет
    const isPage = /.*\/about-us.html$/.test(window.location.pathname);

    if(isPage && innerWidth > 1200) {
        const el = document.querySelector('.main-about-us .button-to-top');
        
        const scrollHeight = document.body.scrollHeight;
        el.style.opacity = 0;

        window.addEventListener('scroll', () => {
            let state = +el.style.opacity;

            if(Math.round(scrollY / scrollHeight * 100) >= 70 && state === 0) {
                el.style.opacity = 1;

            }

            if(Math.round(scrollY / scrollHeight * 100) < 70 && state === 1) {
                el.style.opacity = 0;
            }
        })
    }
}