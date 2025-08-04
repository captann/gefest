document.addEventListener('DOMContentLoaded', () => {
    const fileMode = document.getElementById('file-mode');
    const linkMode = document.getElementById('link-mode');
    const fileSection = document.getElementById('fileUploadSection');
    const linkSection = document.getElementById('linkUploadSection');
    const fileInput = document.getElementById('excelFile');
    const linkInput = document.getElementById('sheetLink');
    const form = document.getElementById('uploadForm');
    const status = document.getElementById('uploadStatus');

    function isValidGoogleSheetLink(link) {
        const pattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)(\/|$)/;
        return pattern.test(link.trim());
    }

    function switchToFileMode() {
        fileSection.style.display = 'block';
        linkSection.style.display = 'none';
        fileInput.required = true;
        linkInput.required = false;
        form.action = '/from_file';
    }

    function switchToLinkMode() {
        fileSection.style.display = 'none';
        linkSection.style.display = 'block';
        fileInput.required = false;
        linkInput.required = true;
        form.action = '/from_link';
    }
        form.addEventListener('submit', (e) => {
        if (linkMode.checked) {
            const link = linkInput.value.trim();
            if (!isValidGoogleSheetLink(link)) {
                e.preventDefault();
                status.textContent = "❌ Невалидная ссылка на Google Таблицу";
                status.style.color = "red";

                setTimeout(() => {
                    status.textContent = '';
                    status.style.color = '';
                }, 3000); // Скрыть через 3 секунды
            }
        }
    });


    fileMode.addEventListener('change', switchToFileMode);
    linkMode.addEventListener('change', switchToLinkMode);

    switchToFileMode();
});