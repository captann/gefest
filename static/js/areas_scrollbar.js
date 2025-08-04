const area_progressBar = document.getElementById('area-scroll-progress-bar');
const area_progressFill = document.getElementById('area-scroll-progress-fill');
const areaList = document.getElementById('areas-container');
const area_title = document.getElementById('area-title');


areaList.addEventListener('scroll', () => {
    const scrollTop = areaList.scrollTop;
    const scrollHeight = areaList.scrollHeight;
    const clientHeight = areaList.clientHeight;

    const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

    // показать полосу вместо заголовка
    if (scrollTop > 15) {
        area_title.setAttribute('hidden', true);
        area_progressBar.style.display = 'block';
        footer.style.display = 'none';
    } else {
        area_title.removeAttribute('hidden', true);
        area_progressBar.style.display = 'none';
        footer.style.display = 'block';
    }

    // применяем ширину только к вложенному fill-элементу
    area_progressFill.style.width = `${scrollPercent}%`;
});

area_progressBar.addEventListener('click', function (event) {
    const rect = area_progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickPercent = clickX / rect.width;

    const scrollHeight = areaList.scrollHeight;
    const clientHeight = areaList.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    areaList.scrollTop = maxScroll * clickPercent;
});

