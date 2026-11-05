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
    if (controls.hidden) {
        controls.hidden = false;
        window.finishAcademicLoading();
    }
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

const audioTracks = {
    menu: new Audio('sounds/menusound.wav'),
    typing: new Audio('sounds/typing.wav'),
    soundtrack: new Audio('sounds/soundtrack.wav'),
};
audioTracks.menu.loop = true;
audioTracks.soundtrack.loop = true;
audioTracks.soundtrack.volume = 0.5;
const pendingAudio = new Set();
let menuActive = false;

function playAudio(track) {
    pendingAudio.delete(track);
    track.play().catch(error => {
        if (error.name === 'NotAllowedError') {
            if (track !== audioTracks.menu || menuActive) pendingAudio.add(track);
        }
        else if (error.name !== 'AbortError') console.error('Erro no áudio do jogo', error);
    });
}

window.academicAudio = cue => {
    if (cue === 'stop-menu') {
        menuActive = false;
        const menu = audioTracks.menu;
        pendingAudio.delete(menu);
        menu.pause();
        menu.currentTime = 0;
        return;
    }
    if (cue === "menu") menuActive = true;
    playAudio(audioTracks[cue]);
};

function retryAudio() {
    for (const track of [...pendingAudio]) playAudio(track);
}
window.addEventListener('click', retryAudio, true);
window.addEventListener('pointerup', retryAudio, true);
window.addEventListener('keydown', retryAudio, true);
