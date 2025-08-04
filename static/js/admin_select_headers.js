function populateHeaderSelectors() {
    let selects = document.querySelectorAll('#headerMappingSection select');
    for (const select of selects) {
        select.innerHTML = ''; // очистить на всякий случай
        for (let i = 0; i < 26; i++) {
            const colLetter = String.fromCharCode(65 + i); // A-Z
            const option = document.createElement('option');
            option.value = colLetter;
            option.textContent = colLetter;
            select.appendChild(option);
        }
    }

}

const defaultColumnsFile = {
    col_task_id: 'A',
    col_date: 'D',
    col_address: 'E',
    col_problem: 'G',
    col_solution: 'H',
    col_signed: 'N'
};

const defaultColumnsLink = {
    col_task_id: 'A',
    col_date: 'C',
    col_address: 'D',
    col_problem: 'E',
    col_solution: 'F',
    col_signed: 'H'
};

function applyDefaultColumnMapping(mapping) {
    Object.entries(mapping).forEach(([name, value]) => {
        const select = document.querySelector(`#headerMappingSection select[name="${name}"]`);
        if (select) select.value = value;
    });
}
document.getElementById('file-mode').addEventListener('change', () => {
    if (document.getElementById('file-mode').checked) {
        applyDefaultColumnMapping(defaultColumnsFile);
    }
});

document.getElementById('link-mode').addEventListener('change', () => {
    if (document.getElementById('link-mode').checked) {
        applyDefaultColumnMapping(defaultColumnsLink);
    }
});

let selects = document.querySelectorAll('#syncHeaderMappingSection select');
    for (const select of selects) {
        select.innerHTML = ''; // очистить на всякий случай
        for (let i = 0; i < 26; i++) {
            const colLetter = String.fromCharCode(65 + i); // A-Z
            const option = document.createElement('option');
            option.value = colLetter;
            option.textContent = colLetter;
            select.appendChild(option);
        }
    }


function applyDefaultColumnMapping2(mapping) {
    Object.entries(mapping).forEach(([name, value]) => {
        const select = document.querySelector(`#syncHeaderMappingSection select[name="sync_${name}"]`);
        console.log(name, '→', select);  // для отладки
        if (select) select.value = value;
    });
}

applyDefaultColumnMapping2(defaultColumnsLink);


