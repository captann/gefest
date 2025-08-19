let taskListFrozen = false;

function formatTaskId(taskId, maxLength) {
    if (typeof taskId !== 'string') {
        taskId = String(taskId);
    }
    if (taskId.length > maxLength) {
        return taskId.substring(0, maxLength - 1) + '…';
    }
    return taskId;
}


let markers = {};
function find_map() {
    let leafletMap = null;
            for (const key in window) {

                if (key.startsWith('map_') && window[key] instanceof L.Map) {
                    leafletMap = window[key];
                    return leafletMap;
                    break;
                }

            }
}


function initMarkers() {
    window.allMarkers = [];
    for (const homeId in houses_colors) {
        const marker = findMarkerByHomeId(homeId);
        if (marker) {
            allMarkers.push(marker);
        }
    }
}
function findMarkerByHomeId(home_id) {
        return markers[home_id];
}

document.addEventListener('DOMContentLoaded', () => {
    showMarkers();
});

function createMarker(map, coords, homeData, tasks) {
    const { home_id, markerColor } = homeData;

    const popupContent = generatePopupContent(homeData, tasks);

    const markerHtml = `
        <div id="marker-${home_id}" style="
            width: 28px;
            height: 28px;
            background-color: ${markerColor};
            border: 2px solid black;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            position: relative;
            box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        "
        onmouseover="this.style.transform='rotate(-45deg) scale(1.2)'; this.style.boxShadow='0 0 10px rgba(0,0,0,0.5)';"
        onmouseout="this.style.transform='rotate(-45deg) scale(1)'; this.style.boxShadow='0 0 6px rgba(0,0,0,0.3)';"
        >
            <div style="
                width: 10px;
                height: 10px;
                background-color: white;
                border-radius: 50%;
                transform: rotate(45deg);
            "></div>
        </div>
    `;

    const marker = L.marker([coords[1], coords[0]], {
        icon: L.divIcon({
            className: '',
            html: markerHtml,
        })
    })
    .bindPopup(popupContent, { maxWidth: 500 });

    marker.addTo(map);

    return marker;
}
function generatePopupContent(homeData, tasks) {
    const { home_id, home_name, home_address } = homeData;
    const isMobile = window.innerWidth < 1000; // Мобильные устройства

  const popupWidth = isMobile ? "250px" : "500px";
  const popupHeight = isMobile ? "350px" : "700px";
  const maxLength = isMobile ? 8 : 14;
  const tasksHtml = tasks.map(task => {
    const checked = task.blank === 1 ? "checked" : "";

    return `
    <div class='task-item-2' style='margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;'
         data-task-id="${task.task_id}" home_id="${home_id}">
        <div style='display: flex; justify-content: space-between; align-items: center;'>
            <button onclick='toggleDescription(${task.task_id})'
                    style='border: none; background: none; cursor: pointer; text-align: left; flex-grow: 1;'>
                <b>#${formatTaskId(task.task_id, maxLength)}</b> - ${task.date}
            </button>
            ${user_role_weight > 0 ? `
            <label style='display: flex; align-items: center; white-space: nowrap; margin-left: 10px;'>
                <input type='checkbox' id='act-checkbox-${task.task_id}'
                       style='margin-right: 5px;'
                       replace_me_id='${task.task_id}'
                       onclick='event.stopPropagation()'
                       data-task-id='${task.task_id}' ${checked}>
                Акт готов
            </label>
            ` : ''}
        </div>
        <div id='desc-${task.task_id}' style='display: none; margin-top: 10px; padding-left: 10px;font-size:18px;'>
            <p><b>Проблема:</b> ${task.problem}</p>
            <p><b>Решение:</b> ${task.solution}</p>
        </div>
    </div>
    `;
}).join("");

    return `
    <div class="popup-mobile" style="max-width: ${popupWidth}; max-height: ${popupHeight}; overflow-y: auto;">
        <h4 style="margin-bottom: 5px; cursor: pointer;" onclick="copyDescription('${home_id} ${home_name} ${home_address}')">${home_name}</h4>
        <p style="margin-top: 0; color: #0078d4; cursor: pointer;"
           data-address="${home_address}"
           onclick="copyAddress(this.dataset.address)">
          ${home_address}
        </p>

        <hr style="margin: 10px 0;">
        <h5 style="margin-bottom: 10px;">Заявки:</h5>
        <div id="tasks-container">
            ${tasksHtml}
        </div>
    </div>
`;
}

let homesList = document.getElementById("homes-list");
let sorted = sort_homes(homes, tasks);

for (let homeId of sorted) {
    let li = document.createElement("li");

    // Кнопка с адресом
    let toggleButton = document.createElement("div");

    let home = homes[homeId];
    let taskInfo = getTaskCountString(homeId, tasks);
    toggleButton.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <span style="font-weight: 600; font-size: 16px; color: #fff;">
                ${home.home_address || "Без названия"}
            </span>
            <span style="font-size: 14px; color: #0078d4; margin-top: 2px;">
                ${homes[homeId].home_name}
            </span>
            ${taskInfo ? `
                <span class="uncompleted-info" style="margin-top: 6px; font-size: 12px; color: #dc3545;">
                    (${taskInfo})
                </span>` : ''
            }
        </div>
    `;


    toggleButton.style.cursor = "pointer";
    toggleButton.className = "toggle-home-button";
    toggleButton.style.width = "100%";
    toggleButton.style.borderBottom="1px solid #444";
    toggleButton.setAttribute("data-home-id", homeId);
    toggleButton.setAttribute("holding", homes[homeId].home_name)


    // Контейнер задач
    let taskContainer = document.createElement("div");
    taskContainer.style.display = "none";
    taskContainer.className = "task-container";

    // Добавляем задачи

    if (tasks[homeId]) {
    tasks[homeId].forEach(task => {
        let taskDiv = document.createElement("div");
        taskDiv.className = "task-item";
        taskDiv.setAttribute("data-lat", homes[homeId].lat);
        taskDiv.setAttribute("data-lon", homes[homeId].lon);
        taskDiv.setAttribute("data-id", task.task_id);
        taskDiv.setAttribute("home_id", homeId);

        // ID задачи
        let taskIdDiv = document.createElement("div");
        taskIdDiv.className = "task-id";
        taskIdDiv.textContent = task.task_id;

        // ✅ Чекбокс
        let label = document.createElement("label");
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.whiteSpace = "nowrap";
        label.style.marginLeft = "10px";
        if (user_role_weight > 0) {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `menu-checkbox-${task.task_id}`;
            checkbox.setAttribute("data-task-id", task.task_id);
            checkbox.setAttribute("replace_me_id", task.task_id);
            checkbox.style.marginRight = "5px";
            checkbox.onclick = (event) => event.stopPropagation();
            if (task.blank == 1) {
                checkbox.setAttribute("checked", true);
            }

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode("Акт готов"));
        }
        // ✅ добавляем всё в taskDiv
        taskDiv.appendChild(taskIdDiv);
        taskDiv.appendChild(label);

        taskContainer.appendChild(taskDiv);
    });
}


    // Обработчик открытия/закрытия задач
    toggleButton.addEventListener("click", (e) => {
        if (taskListFrozen) {
            e.stopPropagation();
            return;}
        taskListFrozen = true;
        setTimeout(() => taskListFrozen = false, 500);
        document.querySelectorAll(".task-container").forEach(container => {
            if (container !== taskContainer) container.style.display = "none";
        });
        taskContainer.style.display = taskContainer.style.display === "none" ? "block" : "none";
    });

    li.appendChild(toggleButton);
    li.appendChild(taskContainer);
    homesList.appendChild(li);
}

function getTaskCountString(homeId, tasks) {
    if (!tasks[homeId]) return "";

    const count = tasks[homeId].filter(task => task.blank === 0).length;
    if (count === 0) return "";

    const suffix = (count % 10 === 1 && count % 100 !== 11) ? "задача"
        : (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) ? "задачи"
        : "задач";

    return `${count} ${suffix}`;
}

function sort_homes(homes, tasks) {
    let homeTaskCounts = Object.keys(homes).map(homeId => {
        // Считаем только задачи, где blank === 0
        let count = tasks[homeId]
            ? tasks[homeId].filter(task => task.blank === 0).length
            : 0;

        let address = homes[homeId].address || "";
        return { homeId, count, address };
    });

    // Сортировка: по убыванию количества незавершённых задач, потом по адресу
    homeTaskCounts.sort((a, b) => {
        if (b.count !== a.count) {
            return b.count - a.count;
        } else {
            return a.address.localeCompare(b.address);
        }
    });

    return homeTaskCounts.map(entry => Number(entry.homeId));
}
function hideMarkers() {
    allMarkers.forEach(marker => {
        marker.remove();
    });
}

function showSeveralMarkers(holdingName) {
    const map = find_map();
    if (!holdingsDict[holdingName]) return;

    for (const home_id of holdingsDict[holdingName]) {
        const marker = markers[home_id];
        if (marker) {
            marker.addTo(map);
        }
    }
}


function showMarkers() {
    const map = find_map();
    let home = null;
    let mark = null;

    // Словарь: холдинг → список home_id

    for (let home_id in homes) {
        home = homes[home_id];
        const holdingName = home.home_name;

        // Добавляем в словарь
        if (holdingName) {
            if (!holdingsDict[holdingName]) {
                holdingsDict[holdingName] = [];
            }
            holdingsDict[holdingName].push(home_id);
        }

        // Создание маркера
        mark = createMarker(
            map,
            [home.lon, home.lat],
            {
                home_id: home.home_id,
                home_name: home.home_name,
                home_address: home.home_address,
                markerColor: houses_colors[home_id]
            },
            tasks[home_id]
        );

        markers[home_id] = mark;
    }

    // Словарь: холдинг → кол-во невыполненных задач
    const holdingsTaskCounts = {};

    for (let holding in holdingsDict) {
        let count = 0;

        for (let home_id of holdingsDict[holding]) {
            const taskList = tasks[home_id] || [];
            for (let task of taskList) {
                if (!task.blank) {
                    count++;
                }
            }
        }

        holdingsTaskCounts[holding] = count;
    }

    // Преобразуем в массив [holding, count]
    let holdingsArray = Object.entries(holdingsTaskCounts);

    // Сортировка: сначала по убыванию количества задач, потом по алфавиту
    holdingsArray.sort((a, b) => {
        if (b[1] !== a[1]) {
            return b[1] - a[1]; // по количеству задач
        }
        return a[0].localeCompare(b[0]); // по алфавиту
    });

    // Формируем окончательный список холдингов
    holdings = holdingsArray.map(entry => entry[0]);

    // Обновляем выпадающий список
    updateHoldingFilter();


    // Инициализация маркеров
    initMarkers();
}


function updateHoldingFilter() {
    const select = document.getElementById("holding-filter");

    // Сохраняем текущее значение, если оно есть
    const prevValue = window.lastSelectedHolding || select.value;

    // Очищаем и заново заполняем
    select.innerHTML = '<option value="all">Все холдинги</option>';

    for (let holding of holdings) {
        const option = document.createElement("option");
        option.value = holding;
        option.textContent = holding;
        select.appendChild(option);
    }

    // Восстанавливаем значение
    if (prevValue && Array.from(select.options).some(opt => opt.value === prevValue)) {
        select.value = prevValue;
    } else {
        select.value = "all";
    }
}



document.addEventListener('change', function (e) {
    const checkbox = e.target;
    // Проверяем, является ли элемент одним из нужных чекбоксов
    if (checkbox.matches('input[type="checkbox"][id^="act-checkbox-"], input[type="checkbox"][id^="menu-checkbox-"]')) {
        const taskId = checkbox.dataset.taskId;
        const data_item = document.getElementById("menu-checkbox-" + taskId).closest(".task-item")
        const lat = parseFloat(data_item.dataset.lat);
        const lon = parseFloat(data_item.dataset.lon);

        const isChecked = checkbox.checked;
        // Отправляем запрос на сервер

        fetch('/update_task_status', {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task_id: taskId,
                status: isChecked
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                checkbox.checked = !isChecked;  // откатываем состояние при ошибке
                console.error('Ошибка:', data.message);
                return;
            }

            // Синхронизация пары чекбоксов
            const altCheckboxId = checkbox.id.startsWith("act-")
                ? "menu-checkbox-" + taskId
                : "act-checkbox-" + taskId;

            const altCheckbox = document.getElementById(altCheckboxId);
            if (altCheckbox) altCheckbox.checked = isChecked;

            // Обновляем маркер
            const prev_color = houses_colors[data.home_id];
            houses_colors[data.home_id] = data.color;

            const marker = markers[data.home_id];
            document.getElementById(`marker-${data.home_id}`).style.backgroundColor = data.color;
            if (marker) {

                for (let j = 0; j < tasks[data.home_id].length; j++) {
                    if (tasks[data.home_id][j].task_id == taskId) {
                        tasks[data.home_id][j].blank = data.blank;
                        break;
                    }
                }
                marker.getPopup().setContent(generatePopupContent(homes[data.home_id], tasks[data.home_id]));

                for (let polygon_id of getPolygonsContainingPoint([lon, lat])) {
                        if (isChecked) {
                            polygonsData[polygon_id]['uncompleted'][0] -= 1;
                            if (data.color == 'green') {
                                 polygonsData[polygon_id]['uncompleted'][1] -= 1;
                            }
                        }
                        else {
                            if (prev_color == 'green') {
                                 polygonsData[polygon_id]['uncompleted'][1] += 1;
                            }
                            polygonsData[polygon_id]['uncompleted'][0] += 1;
                        }

                    }


            } else {
                console.warn(`Элемент с id "${data.home_id}" не найден.`);
            }
        })
        .catch(error => {
            checkbox.checked = !isChecked;
            console.error('Ошибка сети:', error);
        });
    }
});


function getPolygonsContainingPoint(point) {
    const [x, y] = point;
    const result = [];

    for (const [polygonId, polygon] of Object.entries(polygonsData)) {
        const polyPoints = polygon.points;
        let inside = false;

        let [p1x, p1y] = polyPoints[0];

        for (let i = 1; i <= polyPoints.length; i++) {
            const [p2x, p2y] = polyPoints[i % polyPoints.length];

            if (y > Math.min(p1y, p2y)) {
                if (y <= Math.max(p1y, p2y)) {
                    if (x <= Math.max(p1x, p2x)) {
                        if (p1y !== p2y) {
                            const xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x;
                            if (p1x === p2x || x <= xinters) {
                                inside = !inside;
                            }
                        }
                    }
                }
            }
            [p1x, p1y] = [p2x, p2y];
        }

        if (inside) {
            result.push(polygonId);
        }
    }

    return result;
}