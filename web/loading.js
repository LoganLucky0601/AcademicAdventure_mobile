const loading = document.querySelector('#game-loading');
const loadingMessage = document.querySelector('#loading-message');
const loadingStart = document.querySelector('#loading-start');
const loadingTrack = loading.querySelector('.loading-track');
const runtimeProgress = document.querySelector('#progress');
const runtimeMessage = document.querySelector('#infobox');
const runtimeTransfer = document.querySelector('#transfer');

function updateLoading() {
    const ready = runtimeMessage.textContent.includes('Ready to start');
    const downloading = !runtimeTransfer.hidden &&
        runtimeProgress.value > 0 && runtimeProgress.value < runtimeProgress.max;
    loadingTrack.toggleAttribute('data-progress', downloading);
    if (downloading) {
        const percent = Math.floor(runtimeProgress.value / runtimeProgress.max * 100);
        loadingTrack.style.setProperty('--download-progress', percent + '%');
    }
    loading.toggleAttribute('data-ready', ready);
    loadingStart.hidden = !ready;
}

const loadingObserver = new MutationObserver(updateLoading);
loadingObserver.observe(runtimeProgress, {attributes: true});
loadingObserver.observe(runtimeTransfer, {attributes: true});
loadingObserver.observe(runtimeMessage, {childList: true, subtree: true, characterData: true});
loadingStart.addEventListener('click', () => {
    loadingStart.hidden = true;
    loadingMessage.setAttribute('data-opening', '');
    window.academicStartRequested = true;
    loadingObserver.disconnect();
    loadingMessage.textContent = 'Abrindo o jogo…';
});
window.academicStartRequested = false;
updateLoading();

window.finishAcademicLoading = () => {
    loadingObserver.disconnect();
    requestAnimationFrame(() => requestAnimationFrame(() => { loading.hidden = true; }));
};
