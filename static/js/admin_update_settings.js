function sendAddressUpdate(inputRefs, formDiv, isFromMainList = false, isFullForm=false) {
    const home_id = inputRefs['home_id'].value.trim();
    const home_name = inputRefs['home_name'].value.trim();
    const address = inputRefs['home_address'].value.trim();
    const lonlat = inputRefs['latlon'].value.trim();

    const data = { home_id, home_name, address, lonlat };

    fetch('/submit_address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            if (isFromMainList) {
                const existingStatus = formDiv.querySelector('.update-status');
                if (existingStatus) existingStatus.remove();

                const status = document.createElement('span');
                status.className = 'update-status';
                status.style.marginLeft = '10px';
                status.style.color = 'lightgreen';
                status.textContent = '✅ Обновлено';

                formDiv.appendChild(status);

                setTimeout(() => {
                    status.remove();
                }, 3000);
            } else {
                const msg = document.createElement('p');
                msg.textContent = "✅ Обновлено";
                msg.style.color = 'lightgreen';
                msg.style.textAlign = 'center';
                formDiv.innerHTML = '';
                formDiv.appendChild(msg);
                formDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

                setTimeout(() => {
                    formDiv.remove();
                    checkIfAllSubmitted(); // ← логика для возврата загрузочной формы
                }, 3000);
            }
        } else {
            const error = document.createElement('span');
            error.className = 'update-status';
            error.textContent = `❌ ${result.message || 'Ошибка'}`;
            error.style.color = 'red';
            formDiv.appendChild(error);
            setTimeout(() => error.remove(), 3000);
        }
    })
    .catch(() => {
        const error = document.createElement('span');
        error.className = 'update-status';
        error.textContent = '❌ Не удалось отправить данные';
        error.style.color = 'red';
        formDiv.appendChild(error);
        setTimeout(() => error.remove(), 3000);
    });
}
