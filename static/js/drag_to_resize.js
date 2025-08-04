const resizer = document.getElementById('resizer');
const panel = document.getElementById('blok_pannel');
const container = document.getElementById('main-container');

let isDragging = false;

resizer.addEventListener('mousedown', function (e) {
    isDragging = true;
    document.body.style.cursor = 'ew-resize';
});

document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;

    const containerRect = container.getBoundingClientRect();
    const minPanelWidth = 475;
    const maxPanelWidth = containerRect.width * 0.4;
    const pointerX = e.clientX - containerRect.left;

    // Границы
    const newWidth = Math.max(minPanelWidth, Math.min(maxPanelWidth, pointerX));
    panel.style.width = newWidth + 'px';
});

document.addEventListener('mouseup', function () {
    if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'default';
    }
});
