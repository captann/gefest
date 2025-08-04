document.getElementById('copy-close-btn').addEventListener('click', function () {
    const digits = document.querySelectorAll('.code-digit');
    const code = Array.from(digits).map(el => el.value).join('');

    const linkSuffix = document.getElementById('link')?.textContent?.trim();
    const login = document.getElementById('user-login')?.textContent?.trim();
    const fullLink = window.location.origin + linkSuffix;

    const message = `Пользователь ${login} поделился с вами областью.\n` +
                    `Ссылка на добавление области: ${fullLink}\n` +
                    `Код подтверждения: ${code}`;

    navigator.clipboard.writeText(message).then(() => {
        const toast = document.getElementById('copy-toast');
        toast.classList.remove('hidden');
        toast.classList.add('visible');

        setTimeout(() => {
            toast.classList.remove('visible');
            toast.classList.add('hidden');

            // Переход обратно
            window.history.back();
        }, 1000);
    });
});

document.getElementById('copy-link-only').addEventListener('click', function () {
    const linkSuffix = document.getElementById('link')?.textContent?.trim();
    const fullLink = window.location.origin + linkSuffix;

    navigator.clipboard.writeText(fullLink).then(() => {
        const toast = document.getElementById('copy-toast');
        toast.innerHTML = `<span style="color: #00e676;">&#10004;</span>${' Скопировано в буфер обмена'}`;;
        toast.classList.remove('hidden');
        toast.classList.add('visible');

        setTimeout(() => {
            toast.classList.remove('visible');
            toast.classList.add('hidden');
            window.history.back();
        }, 3000);
    });
});
