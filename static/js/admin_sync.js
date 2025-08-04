function startSync() {
    const btn = document.getElementById('syncButton');
    const status = document.getElementById('syncStatus');
    const sheetLink = document.getElementById('syncSheetLink').value.trim();

    // Валидация: гугл таблица
    const isValid = /^https:\/\/docs\.google\.com\/spreadsheets\/d\//.test(sheetLink);
    if (!isValid) {
        status.innerHTML = "❌ Неверная ссылка на Google-таблицу";
        status.style.color = "red";
        setTimeout(() => status.innerHTML = '', 3000);
        return;
    }

    // Блокируем кнопку
    btn.disabled = true;
    btn.innerText = "Синхронизация...";

    // Создаём объект FormData
    const formData = new FormData();

    // Добавляем в форму файл, если есть

    // Добавляем ссылку и все поля синхронизации
    const sheetInput = document.querySelector('#syncSheetLink');
    const linkInput = document.querySelector('#syncSheetName');
    formData.append('sheet',  linkInput.value.trim());
    formData.append('link', sheetInput.value);

    // Добавляем все данные с выбором столбцов и подписанными значениями
    document.querySelectorAll('#syncHeaderMappingSection select, #syncHeaderMappingSection input').forEach(input => {
        formData.append(input.name, input.value);
    });

    // Отправляем запрос на сервер
    fetch('/synchronice', {
        method: 'POST',
        body: formData, // Отправляем данные как форму
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            status.innerHTML = "✅ " + (data.message || "Синхронизировано");;
            status.style.color = "lightgreen";
            sheetInput.value = '';
            linkInput.value = '';
        } else {
            status.innerHTML = "❌ " + (data.message || "Ошибка");
            status.style.color = "red";
        }
        setTimeout(() => status.innerHTML = '', 3000);
    })
    .catch(err => {
        status.innerHTML = "❌ Ошибка соединения";
        status.style.color = "red";
        setTimeout(() => status.innerHTML = '', 3000);
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerText = "Синхронизировать";
    });
}
