let my_marker = null;
function showMe() {
    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    try {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;

                        // Создаём маркер на карте
                        createMarker2(map_, [lat, lng])
                        /*L.marker([lat, lng])
                            .addTo(map_)
                            .bindPopup("Вы находитесь здесь!")
                            .openPopup(); */

                        // Перемещаем карту к местоположению пользователя
                        map_.setView([lat, lng], 17);
                    } catch (innerError) {
                        console.error("Ошибка при работе с картой:", innerError);
                    }
                },
                function(error) {
                    showCopyNotification("Ошибка получения геолокации:" +  error, true);
                }
            );
        } else {
            showCopyNotification("Геолокация не поддерживается браузером", true);

        }
    } catch (error) {
        console.error("Неожиданная ошибка:", error);
        // Можно добавить резервный маркер и здесь, если нужно
    }
}



function createMarker2(map, coords) {
    if (my_marker) {
        my_marker.remove()
    }
    const markerHtml = `
        <div id="marker-my-location" style="
            width: 28px;
            height: 28px;
            background-color: orange;
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

    my_marker = L.marker([coords[0], coords[1]], {  // исправил порядок
        icon: L.divIcon({
            className: '',
            html: markerHtml,
        })
    })

    my_marker.addTo(map); // добавляем маркер на карту
    my_marker.on('click', function() {
        my_marker.remove()
    });

    return my_marker;
}

function generatePopupContent2(homeData, tasks) {
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
                <label style='display: flex; align-items: center; white-space: nowrap; margin-left: 10px;'>
                    <input type='checkbox' id='act-checkbox-${task.task_id}'
                           style='margin-right: 5px;'
                           replace_me_id='${task.task_id}'
                           onclick='event.stopPropagation()'
                           data-task-id='${task.task_id}' ${checked}>
                    Акт готов
                </label>
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
        <h4 style="margin-bottom: 5px;">${home_name}</h4>
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
