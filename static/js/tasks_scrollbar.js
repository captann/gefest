const progressBar = document.getElementById('scroll-progress-bar');
const progressFill = document.getElementById('scroll-progress-fill');
const footer = document.getElementById('footer');
const tasksList = document.getElementById('tasks-list');
const title = document.getElementById('task-title');


tasksList.addEventListener('scroll', () => {
    const scrollTop = tasksList.scrollTop;
    const scrollHeight = tasksList.scrollHeight;
    const clientHeight = tasksList.clientHeight;

    const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

    // показать полосу вместо заголовка
    if (scrollTop > 15) {
        title.style.display = 'none';
        progressBar.style.display = 'block';
        footer.style.display = 'none';
    } else {
        title.style.display = 'block';
        progressBar.style.display = 'none';
        footer.style.display = 'block';
    }

    // применяем ширину только к вложенному fill-элементу
    progressFill.style.width = `${scrollPercent}%`;
});

progressBar.addEventListener('click', function (event) {
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickPercent = clickX / rect.width;

    const scrollHeight = tasksList.scrollHeight;
    const clientHeight = tasksList.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    tasksList.scrollTop = maxScroll * clickPercent;
});

