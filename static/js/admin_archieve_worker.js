function renderTasksDone(tasks) {
    const tbody = document.getElementById("tasksDoneBody");
    tbody.innerHTML = "";
    tasks.forEach(task => {
        const row = document.createElement("tr");

        row.innerHTML = `
    <td>${task.task_id}</td>
    <td>${task.address}</td>
    <td>${task.date}</td>
    <td class="checkbox-cell"><input type="checkbox" class="archive-checkbox" data-task-id="${task.task_id}"></td>
`;


        tbody.appendChild(row);
    });
}

function toggleAllArchives(masterCheckbox) {
    const newState = masterCheckbox.checked;
    const checkboxes = document.querySelectorAll('.archive-checkbox');

    const taskIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.taskId));
    checkboxes.forEach(cb => cb.checked = newState);  // обновим состояние визуально

    fetch('/bulk_update_archived', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            task_ids: taskIds,
            archieved: newState
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert("Ошибка: " + data.message);
        }
    })
    .catch(err => {
        alert("Сервер недоступен");
        console.error(err);
    });
}


function onArchiveCheckboxChanged(checkbox) {
    setTaskArchived(checkbox); // обновим БД

    const checkboxes = document.querySelectorAll('.archive-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const master = document.getElementById('archiveAllCheckbox');

    master.checked = allChecked;
}