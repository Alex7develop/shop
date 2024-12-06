export default function(from, to) {
    from.addEventListener('click', (e) => {
        e.preventDefault();

        to.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest"
        })
    })
} 