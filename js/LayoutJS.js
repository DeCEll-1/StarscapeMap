
const body = document.body;

const intro = document.getElementById('intro');
const center_logo = document.getElementById('center-logo');

const cover = document.getElementById('content-cover');
let firstDuration = 2000;


intro.addEventListener('animationstart', () => {
    setTimeout(() => {
        center_logo.style.visibility = "visible"
        // center_logo.hidden = false;
        center_logo.style.animation = 'slideToLeftFromRight 2s forwards';
    }, firstDuration / 2); // start second animation halfway through first
});

intro.addEventListener('animationend', () => {
    cover.style.visibility = 'hidden'
    body.style.overflow = 'auto'; // or 'scroll'
});

intro.style.animation = "slideUpAndShrink 2s forwards";