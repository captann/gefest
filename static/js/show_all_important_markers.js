document.getElementById("show_all_important_markers").addEventListener("change", function() {
    fetch('/show_all_important_markers', {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                state: this.checked
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                this.checked = !this.checked;  // откатываем состояние при ошибке
                console.error('Ошибка:', data.message);
                return;
            }

            // Синхронизация пары чекбоксов

        })
        .catch(error => {
            this.checked = !this.checked;
            console.error('Ошибка сети:', error);
        });
});

