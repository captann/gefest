let res = null;
async function updateActivationNumber() {
    const activationNumber = document.getElementById('activation-count').value;
    const linkSuffix = document.getElementById('link')?.textContent?.trim();

    if (!activationNumber || !linkSuffix) {
        alert("Не указаны данные для обновления");
        return false;
    }

    try {
        const response = await fetch('/update_activation_number', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                linkSuffix: linkSuffix,
                user_id: parseInt(document.getElementById('user-id')?.textContent?.trim(), 10),
                activationNumber: parseInt(activationNumber, 10)
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка запроса: ' + response.status);
        }

        const data = await response.json();
        return true;

    } catch (error) {
        console.error('Ошибка:', error);
        alert("Произошла ошибка при обновлении");
        return false;
    }
}

// Теперь можно вызвать функцию и дождаться её результата
async function main() {
    res = await updateActivationNumber();
}


document.getElementById('copy-close-btn').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('copy-close-btn').textContent = 'Генерируем ссылку…';
    document.getElementById('copy-close-btn').setAttribute('disabled', true)


    const digits = document.querySelectorAll('.code-digit');
    const code = Array.from(digits).map(el => el.value).join('');

    const linkSuffix = document.getElementById('link')?.textContent?.trim();
    const login = document.getElementById('user-login')?.textContent?.trim();
    const fullLink = window.location.origin + linkSuffix;

    const message = `Пользователь ${login} поделился с вами областью.\n` +
                    `Ссылка на добавление области: ${fullLink}\n` +
                    `Код подтверждения: ${code}`;
    main().then(() => {
    if (res) {
        navigator.clipboard.writeText(message).then(() => {
            /*const toast = document.getElementById('copy-toast');
            toast.classList.remove('hidden');
            toast.classList.add('visible'); */
            document.getElementById('copy-close-btn').textContent = 'Скопировано!';


            setTimeout(() => {
                // Переход обратно
                window.location.href = '/';
            }, 500);
        });
    }
});
});

document.getElementById('copy-link-only').addEventListener('click', function () {
    const linkSuffix = document.getElementById('link')?.textContent?.trim();
    const fullLink = window.location.origin + linkSuffix;
    if (updateActivationNumber()) {
        navigator.clipboard.writeText(fullLink).then(() => {
            const toast = document.getElementById('copy-toast');
            toast.innerHTML = `<span style="color: #00e676;">&#10004;</span>${' Скопировано в буфер обмена'}`;
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

