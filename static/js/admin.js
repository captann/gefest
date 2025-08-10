let sortState = {
    tasksNot: { key: null, direction: null },
    tasksDone: { key: null, direction: null }
};
let fixTotal = 0;
let fixCount = 0;
let confirmTotal = 0;
let confirmCount = 0;


function parseDate(dateStr) {
    const match = dateStr.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})(?:[ \n](\d{2}):(\d{2}))?/);
    if (!match) return new Date(0);
    const [ , day, month, year, hour = '00', minute = '00' ] = match;
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour}:${minute}`);
}

function getFilteredTasks(original, query, type) {
    const q = query.toLowerCase();
    return original.filter(task => {
        if (type === 'id') return String(task.task_id).includes(q);
        if (type === 'address') return task.address.toLowerCase().includes(q);
        return true;
    });
}

function renderTasks(tableId, tasks) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = '';
    tasks.forEach(task => {
        const row = document.createElement('tr');
        let archiveCell = '';

        // Добавляем чекбокс "в архиве", только для таблицы сделанных задач
        if ( (tableId === 'tasksDoneBody') && (user_role_weight > 1) ) {
            const isChecked = task.archieved ? 'checked' : '';
            archiveCell = `<td>
            <input type="checkbox"
                   class="archive-checkbox"
                   data-task-id="${task.task_id}"
                   ${isChecked}
                   onchange="onArchiveCheckboxChanged(this)">
        </td>`;
        }
        else if (tableId === 'tasksDoneBody')
        {
            const isChecked = task.archieved ? 'Да' : 'Нет';
            archiveCell = `<td><p>${isChecked}</p></td>`;
        }

        row.innerHTML = `
            <td>${task.task_id}</td>
            <td>${task.address}</td>
            <td>${task.date}</td>
            ${archiveCell}
        `;

        tbody.appendChild(row);
    });
}


function sortTasks(type, key) {
    const state = sortState[type];
    const tableId = type === 'tasksNot' ? 'tasksNotBody' : 'tasksDoneBody';
    const table = document.getElementById(type + 'Table');
    const allThs = table.querySelectorAll('th');

    if (state.key === key) {
        if (state.direction === 'asc') {
            state.direction = 'desc';
        } else if (state.direction === 'desc') {
            state.key = null;
            state.direction = null;
        } else {
            state.direction = 'asc';
        }
    } else {
        state.key = key;
        state.direction = 'asc';
    }

    allThs.forEach(th => {
        th.classList.remove('sorted');
        th.removeAttribute('data-arrow');
    });

    const indexMap = { task_id: 0, address: 1, date: 2 };
    if (state.key && state.direction) {
        const th = allThs[indexMap[key]];
        th.classList.add('sorted');
        th.dataset.arrow = state.direction === 'asc' ? '▲' : '▼';
    }

    filterTasks();
}

function filterTasks() {
    ['tasksNot', 'tasksDone'].forEach(type => {
        const state = sortState[type];
        const tableId = type === 'tasksNot' ? 'tasksNotBody' : 'tasksDoneBody';
        const original = type === 'tasksNot' ? tasks_not : tasks_done;
        const query = document.getElementById('taskSearch').value;
        const searchType = document.getElementById('searchType').value;

        let filtered = getFilteredTasks(original, query, searchType);

        if (state.key && state.direction) {
            filtered.sort((a, b) => {
                let valA = a[state.key];
                let valB = b[state.key];
                if (state.key === 'date') {
                    valA = parseDate(valA);
                    valB = parseDate(valB);
                }
                if (valA < valB) return state.direction === 'asc' ? -1 : 1;
                if (valA > valB) return state.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        renderTasks(tableId, filtered);
    });
}

document.getElementById('taskSearch').addEventListener('input', filterTasks);
document.getElementById('searchType').addEventListener('change', filterTasks);

document.addEventListener('DOMContentLoaded', () => {
    filterTasks();
    if (user_role_weight > 1) {
    populateHeaderSelectors();
    applyDefaultColumnMapping(defaultColumnsFile);
    }

});
if (user_role_weight > 1) {
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    const fileMode = document.getElementById('file-mode').checked;
    const linkInput = document.getElementById('sheetLink'); // добавьте id="sheetLink" в поле ввода ссылки
    const form = e.target;
        const linkMode = document.getElementById('link-mode');

        // Меняем action в зависимости от выбранного режима
        if (linkMode.checked) {
            form.action = '/from_link';
        } else {
            form.action = '/from_file';
        }
    e.preventDefault();
    const fileInput = document.getElementById('excelFile');
    const sheetInput = document.getElementById('sheetName');
    const uploadBtn = document.getElementById('uploadBtn');
    const status = document.getElementById('uploadStatus');



    if (fileMode) {
        if (fileInput.files.length === 0 || !sheetInput.value.trim()) {
            alert('Заполните все поля (файл и название листа)');
            return;
        }
    } else {
        if (!linkInput.value.trim() || !sheetInput.value.trim()) {
            alert('Заполните все поля (ссылка и название листа)');
            return;
        }
    }


    uploadBtn.textContent = 'Загружаем...';
    uploadBtn.disabled = true;
    fileInput.disabled = true;
    sheetInput.disabled = true;
    status.textContent = '';

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('sheet', sheetInput.value);
    formData.append('link', linkInput.value.trim());
    document.querySelectorAll('#headerMappingSection select, #headerMappingSection input').forEach(input => {
    formData.append(input.name, input.value);
});
    formData.append('signed_value', formData.get('signed_value'))

    if (true) {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const container = document.getElementById('addressFixContainer');
        container.innerHTML = '';

    const result = await response.json();
    renderAlreadyExistingTasksTable(result.already_existing);
            document.getElementById('sheetName').value = "";
        if (result.success) {
    status.innerHTML = `<span style="color: #00e676;">&#10004;</span> Задачи загружены`;
    status.style.color = "#00e676";
    status.style.textAlign = "center";
    fileInput.value = '';
    linkInput.value = '';

    setTimeout(() => {
        status.textContent = '';
    }, 3000);
}
 else {
 status.innerHTML = `<span style="color: red;">&#10060;</span> ${result.message || 'Ошибка загрузки'}`;
    status.style.color = "red";
    status.style.textAlign = "center";


    setTimeout(() => {
        status.textContent = '';
    }, 3000);
    const uploadForm = document.getElementById('uploadForm');
const container = document.getElementById('addressFixContainer');
container.innerHTML = '';
Total = 0;
Count = 0;
fixTotal = 0;
confirmTotal = 0;
fixCount = 0;
confirmCount = 0;

let hasFixes = false;

if (result.incorrect_addresses && result.incorrect_addresses.length > 0) {
    hasFixes = true;
    const sectionTitle = document.createElement('h3');
    sectionTitle.id = 'bad-address-title';
    sectionTitle.style.color = 'orange';
    sectionTitle.textContent = 'Некорректные адреса';
    container.appendChild(sectionTitle);

    fixTotal = result.incorrect_addresses.length;

    result.incorrect_addresses.forEach(str => {
        const form = createAddressForm(str, {}, false, false);
        container.appendChild(form);
    });
    console.log(container);
}

if (result.submit_required && result.submit_required.length > 0) {
    hasFixes = true;
    const sectionTitle = document.createElement('h3');
    sectionTitle.id = 'coords-confirm-title';
    sectionTitle.style.color = 'orange';
    sectionTitle.textContent = 'Требуют уточнения координат';
    container.appendChild(sectionTitle);

    confirmTotal = result.submit_required.length;

    result.submit_required.forEach(obj => {
        const combinedStr = `${obj.home_id} ${obj.home_name} ${obj.home_address}`;
        const form = createAddressForm(combinedStr, obj, false, false);
        container.appendChild(form);
    });
}

// ⬇️ Скрываем форму, если есть что править
if (hasFixes) {
    uploadForm.style.display = 'none';
    fixTotal = result.incorrect_addresses?.length || 0;
    confirmTotal = result.submit_required?.length || 0;
    fixCount = 0;
    confirmCount = 0;

const warn = document.getElementById('warninfo');
if (fixTotal > 0 || confirmTotal > 0) {
    warn.style.display = 'block';
    document.getElementById('uploadForm').style.display = 'none';
}
}

}


    } else  {
        status.textContent = 'Произошла ошибка при загрузке';}

        uploadBtn.textContent = 'Загрузить';
        uploadBtn.disabled = false;
        fileInput.disabled = false;
        sheetInput.disabled = false;
        fileInput.value = '';

});
}
function setTaskArchived(checkbox) {
    const taskId = parseInt(checkbox.dataset.taskId);
    const isChecked = checkbox.checked;

    fetch('/set_task_archived', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            task_id: taskId,
            archieved: isChecked
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert("Ошибка: " + data.message);
            checkbox.checked = !isChecked;  // откат если ошибка
        }
    })
    .catch(err => {
        alert("Сервер недоступен");
        checkbox.checked = !isChecked;  // откат при ошибке
        console.error(err);
    });
}




