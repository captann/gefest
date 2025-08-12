document.getElementById('taskType').addEventListener('change', function () {
    const modeSwitcher = document.querySelector('.mode-switcher');
    const linkMode = document.querySelector('#link-mode'); // radio link-mode
    const standard_field = document.querySelector('#headerMappingSection');
    const ppr_fields = document.querySelector("#headerMappingSection_ppr")

    if (this.value === 'ppr') {
        // Выбираем режим "link"
        if (linkMode) {
            linkMode.click();
        }
        // Скрываем кнопки выбора режима
        if (modeSwitcher) {
            modeSwitcher.style.display = 'none';
        }
        standard_field.style.display = 'none';
        ppr_fields.style.display = "block";
        document.getElementById("sheetLink").value = ""


    } else {
        // Показываем кнопки выбора режима
        if (modeSwitcher) {
            modeSwitcher.style.display = '';
        }
        ppr_fields.style.display = "none";
        standard_field.style.display = 'block';
        document.getElementById("sheetLink").value = "https://docs.google.com/spreadsheets/d/1i6XreBzCqaFlfUAAJ2DRBZO2HrxnPDzh3HDIpl6fWH8";
    }
});
