document.getElementById('copy-close-btn').addEventListener('click', function () {
    const digits = document.querySelectorAll('.code-digit');
    const code = Array.from(digits).map(el => el.value).join('');

    const linkSuffix = document.getElementById('link')?.textContent?.trim();
    const login = document.getElementById('user-login')?.textContent?.trim();
    const fullLink = window.location.origin + linkSuffix;

    const message = `Пользователь ${login} поделился с вами областью.\n` +
                    `Ссылка на добавление области: ${fullLink}\n` +
                    `Код подтверждения: ${code}`;
    if (updateActivationNumber()) {
        navigator.clipboard.writeText(message).then(() => {
            const toast = document.getElementById('copy-toast');
            toast.classList.remove('hidden');
            toast.classList.add('visible');

            setTimeout(() => {
                toast.classList.remove('visible');
                toast.classList.add('hidden');

                // Переход обратно
                window.location.href = '/';
            }, 500);
        });
    }
});

document.getElementById('copy-link-only').addEventListener('click', function () {
    const linkSuffix = document.getElementById('link')?.textContent?.trim();
    const fullLink = window.location.origin + linkSuffix;
    if (updateActivationNumber()) {
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
    }
});

function updateActivationNumber() {
     activationNumber = document.getElementById('activation-count').value;
     linkSuffix = document.getElementById('link')?.textContent?.trim();

    if (!activationNumber || !linkSuffix) {
        alert("Не указаны данные для обновления");
        return false;
    }

fetch('/123', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            linkSuffix: linkSuffix,
            user_id: parseInt(document.getElementById('user-id')?.textContent?.trim(), 10),
            activationNumber: parseInt(activationNumber, 10)

        })
    })

    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка запроса: ' + response.status);
        }
        return response.json();
    })
    .then(data => {

        return true;
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert("Произошла ошибка при обновлении");
        return false;
    });
}
