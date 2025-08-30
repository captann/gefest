function submit_whole_holding(holding) {
    if (holding in holdingsDict) {
        fetch('/complete_all_holding', {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                home_ids: holdingsDict[holding]

            })
        })
        .then(response => response.json())
        .then(data => {
            showLoading();
            if (data.status !== 'success') {
                showCopyNotification("Не удалось отметить холдинг", true);

                setTimeout(function() {
                    window.location.reload();
                }, 1000);
                return;
            } else {
                showCopyNotification("Холдинг отмечен", false);
                setTimeout(function() {
                    window.location.reload();
                }, 1000);
                return;
            }

        })
        .catch(error => {
            showCopyNotification('Ошибка сети:', error, true);

        });
    } else {

        showCopyNotification("Холдинг не найден", true);
        hideLoading();
    }
}