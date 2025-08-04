function renderAlreadyExistingTasksTable(data) {
    const section = document.getElementById("existingTasksTableSection");
    const tbody = document.getElementById("existingTasksTableBody");
    const searchInput = document.getElementById("taskSearchInput");

    tbody.innerHTML = "";
    section.style.display = "block";

    // Строки таблицы
    data.forEach(task => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-task-id", task.task_id);  // для фильтрации

        tr.innerHTML = `
            <td>${task.task_id}</td>
            <td style="text-align:center;">
                <input type="checkbox" name="blank_${task.task_id}" ${task.blank ? "checked" : ""}>
            </td>
            <td style="text-align:center;">
                <input type="checkbox" name="archived_${task.task_id}" ${task.archieved ? "checked" : ""}>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Поиск
    searchInput.oninput = function () {
        const term = this.value.trim().toLowerCase();
        const rows = tbody.querySelectorAll("tr");
        rows.forEach(row => {
            const id = row.getAttribute("data-task-id");
            row.style.display = id.includes(term) ? "" : "none";
        });
    };

    // Чекбокс "выбрать все" — blank
    document.getElementById("checkAllBlank").onchange = function () {
        const checked = this.checked;
        tbody.querySelectorAll("input[name^='blank_']").forEach(cb => cb.checked = checked);
    };

    // Чекбокс "выбрать все" — archive
    document.getElementById("checkAllArchive").onchange = function () {
        const checked = this.checked;
        tbody.querySelectorAll("input[name^='archived_']").forEach(cb => cb.checked = checked);
    };

    // Отправка формы
    document.getElementById("existingTasksForm").onsubmit = function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const tasksToUpdate = [];

        data.forEach(task => {
            const id = task.task_id;
            tasksToUpdate.push({
                task_id: id,
                blank: formData.get(`blank_${id}`) === "on",
                archieved: formData.get(`archived_${id}`) === "on"
            });
        });

        fetch("/update_existing_tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tasks: tasksToUpdate })
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                const successMessage = document.createElement("div");
                successMessage.className = "update-status";
                successMessage.style.color = "lightgreen";
                successMessage.style.marginTop = "10px";
                successMessage.textContent = "✅ Обновлено";

                // Заменяем форму на сообщение
                section.innerHTML = "";
                section.appendChild(successMessage);
                        successMessage.scrollIntoView({ behavior: "smooth", block: "center" });


                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
            }
 else {
                alert("Ошибка: " + res.message);
            }
        })
        .catch(err => alert("Ошибка сети: " + err));
    };
}
