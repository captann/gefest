if (user_role_weight > 1) {
const emailEl = document.getElementById('copyEmail');
const noteEl = document.getElementById('copyNote');

emailEl.addEventListener('click', async () => {
    const email = emailEl.textContent;

    try {
        await navigator.clipboard.writeText(email);

        // Заменяем текст, меняем стиль на зелёный, курсор на default
        noteEl.innerHTML = `<span style="color: #00e676;">&#10004;</span> Скопировано в буфер обмена`;
        noteEl.style.color = '#00e676';
        noteEl.style.cursor = 'default';

        setTimeout(() => {
            // Возвращаем оригинальный текст, цвет и курсор
            noteEl.innerHTML = `Добавьте аккаунт <b id="copyEmail">${email}</b> в доступ к таблице`;
            noteEl.style.color = 'orange';
            noteEl.style.cursor = 'pointer';

            attachCopyHandler(); // Перепривязка обработчика
        }, 3000);
    } catch (err) {
        alert('❌ Не удалось скопировать');
    }
});

function attachCopyHandler() {
    const newEmailEl = document.getElementById('copyEmail');
    if (newEmailEl) {
        newEmailEl.addEventListener('click', async () => {
            const email = newEmailEl.textContent;
            try {
                await navigator.clipboard.writeText(email);
                noteEl.innerHTML = `<span style="color: #00e676;">&#10004;</span> Скопировано в буфер обмена`;
                noteEl.style.color = '#00e676';
                noteEl.style.cursor = 'default';
                setTimeout(() => {
                    noteEl.innerHTML = `Добавьте аккаунт <b id="copyEmail" style="color: orange;">${email}</b> в доступ к таблице`;
                    noteEl.style.color = '#aaa';
                    noteEl.style.cursor = 'pointer';
                    attachCopyHandler();
                }, 3000);
            } catch {
                alert('❌ Не удалось скопировать');
            }
        });
    }
}

attachCopyHandler();
}

const emailEl2 = document.getElementById('copyEmail2');
const noteEl2 = document.getElementById('copyNote2');

emailEl2.addEventListener('click', async () => {
    const email = emailEl2.textContent;

    try {
        await navigator.clipboard.writeText(email);

        noteEl2.innerHTML = `<span style="color: #00e676;">&#10004;</span> Скопировано в буфер обмена`;
        noteEl2.style.color = '#00e676';
        noteEl2.style.cursor = 'default';

        setTimeout(() => {
            noteEl2.innerHTML = `Добавьте аккаунт <b id="copyEmail2" style="color: orange;">${email}</b> в доступ к таблице`;
            noteEl2.style.color = '#aaa';
            noteEl2.style.cursor = 'pointer';

            attachCopyHandler2(); // снова повесим
        }, 3000);
    } catch (err) {
        alert('❌ Не удалось скопировать');
    }
});

function attachCopyHandler2() {
    const newEmailEl2 = document.getElementById('copyEmail2');
    if (newEmailEl2) {
        newEmailEl2.addEventListener('click', async () => {
            const email = newEmailEl2.textContent;
            try {
                await navigator.clipboard.writeText(email);
                noteEl2.innerHTML = `<span style="color: #00e676;">&#10004;</span> Скопировано в буфер обмена`;
                noteEl2.style.color = '#00e676';
                noteEl2.style.cursor = 'default';
                setTimeout(() => {
                    noteEl2.innerHTML = `Добавьте аккаунт <b id="copyEmail2" style="color: orange;">${email}</b> в доступ к таблице`;
                    noteEl2.style.color = '#aaa';
                    noteEl2.style.cursor = 'pointer';
                    attachCopyHandler2();
                }, 3000);
            } catch {
                alert('❌ Не удалось скопировать');
            }
        });
    }
}

attachCopyHandler2();

