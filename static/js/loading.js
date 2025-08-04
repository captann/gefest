function showLoading() {
    const main = document.getElementById('main-container');
    const overlay = document.getElementById('loading-overlay');
    if (main) main.style.display = 'none';

    overlay.classList.add('visible');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    const main = document.getElementById('main-container');

    overlay.classList.remove('visible');
    setTimeout(() => {
        if (main) main.style.display = 'flex';
    }, 100); // подождать пока исчезнет overlay
}
