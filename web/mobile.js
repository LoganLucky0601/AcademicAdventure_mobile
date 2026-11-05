const controls = document.querySelector('#mobile-controls');
const form = document.querySelector('#name-form');
const nameInput = form.elements.playerName;
const active = new Map();
const presses = [];
let submittedName = null;

function release(pointer) {
    const button = active.get(pointer);
    active.delete(pointer);
    if (button && ![...active.values()].includes(button)) {
        button.removeAttribute('data-pressed');
    }
}

for (const button of controls.querySelectorAll('[data-key]')) {
    button.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        active.set(event.pointerId, button);
        button.setAttribute('data-pressed', '');
        presses.push(button.dataset.key);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        button.addEventListener(type, event => release(event.pointerId));
    }
    button.addEventListener('click', event => {
        if (event.detail === 0) presses.push(button.dataset.key);
    });
}

function resetControls() {
    for (const pointer of active.keys()) release(pointer);
    presses.length = 0;
}
window.addEventListener('blur', resetControls);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) resetControls();
});

form.addEventListener('submit', event => {
    event.preventDefault();
    if (!nameInput.value.trim()) return;
    submittedName = nameInput.value.trim();
    nameInput.blur();
});
form.addEventListener('keydown', event => event.stopPropagation());

window.academicMobileFrame = scene => {
    controls.hidden = false;
    const naming = scene === 'naming';
    if (form.hidden === naming) {
        form.hidden = !naming;
        if (naming) nameInput.value = '';
    }
    const frame = JSON.stringify({
        held: [...new Set([...active.values()].map(button => button.dataset.key))],
        presses: presses.splice(0),
        name: submittedName,
    });
    submittedName = null;
    return frame;
};

const fullscreen = document.querySelector('#fullscreen');
if (document.fullscreenEnabled) {
    fullscreen.hidden = false;
    fullscreen.addEventListener('click', async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await document.documentElement.requestFullscreen();
            }
        } catch (error) {
            console.warn('Tela cheia indisponível', error);
        }
    });
    document.addEventListener('fullscreenchange', () => {
        fullscreen.setAttribute('aria-label',
            document.fullscreenElement ? 'Sair da tela cheia' : 'Tela cheia');
    });
}
