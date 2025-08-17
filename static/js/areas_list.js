function attachCheckboxListeners() {
    checkboxes = get_checkboxes();
    for (let polygon_id in checkboxes) {
        checkboxes[polygon_id].addEventListener("change", () => update_visibility(polygon_id));
    }
}

function pluralize(count, [one, few, many]) {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
}


function sortPolygonsData(polygonsData) {
    const entries = Object.entries(polygonsData);

    entries.sort((a, b) => {
        const aData = a[1];
        const bData = b[1];

        const aChecked = Number(aData.checked);
        const bChecked = Number(bData.checked);

        const aTasks = Number(aData.uncompleted?.[0] || 0);
        const bTasks = Number(bData.uncompleted?.[0] || 0);

        const aObjs = Number(aData.uncompleted?.[1] || 0);
        const bObjs = Number(bData.uncompleted?.[1] || 0);

        if (aChecked !== bChecked) return bChecked - aChecked;
        if (aTasks !== bTasks) return bTasks - aTasks;
        if (aObjs !== bObjs) return bObjs - aObjs;
        return (aData.name || '').localeCompare(bData.name || '');
    });

    return entries.map(([id]) => id); // вернём массив отсортированных ключей
}

function renderPolygonsList() {
    const sorted_keys = sortPolygonsData(polygonsData);
    const html = newList(polygonsData, sorted_keys);

    document.getElementById('areas-container').innerHTML = html;
    attachCheckboxListeners();
}
function newList(polygonsData, sortedKeys = null, userId = user) {
    let html = '';
    const keys = sortedKeys || Object.keys(polygonsData);

    if (!keys.length) {

        document.getElementById("area-search").setAttribute("hidden", true);
        document.getElementById("areas-container").setAttribute("hidden", true);
        document.getElementById("area-title").setAttribute("hidden", true);
        console.log(document.getElementById("area-title"));
    } else {
        document.getElementById("area-search").removeAttribute("hidden");
        document.getElementById("areas-container").removeAttribute("hidden");
        document.getElementById("area-title").removeAttribute("hidden");
    }

    for (const polygonId of keys) {
        const polygon = polygonsData[polygonId];
        const polygonName = polygon.name || `Полигон ${polygonId}`;
        const checkedAttr = polygon.checked ? 'checked' : '';

        html += `
        <div class="area-item" area_id="${polygonId}" style="display: flex; align-items: center; justify-content: space-between; padding: 5px 0;">
            <div style="display: flex; align-items: center;" class="task-id">
                <input type="checkbox"
                    class="area-checkbox"
                    data-area-id="${polygonId}"
                    style="margin-right: 8px;" ${checkedAttr}>

                <span class="area-name" onclick="focusOnArea('${polygonId}')">${polygonName}</span>

                <!--<span class="uncompleted-info" style="margin-left: 8px; font-size: 12px; color: #555;">
                    (${polygon.uncompleted?.[0] || 0} ${pluralize(polygon.uncompleted?.[0] || 0, ['задача', 'задачи', 'задач'])},
                     ${polygon.uncompleted?.[1] || 0} ${pluralize(polygon.uncompleted?.[1] || 0, ['объект', 'объекта', 'объектов'])})
                </span> -->
            </div>
            <div class="area-actions">
                <button class="btn delete-area-btn" data-area-id="${polygonId}" onclick="delete_area(this);">
                    Удалить
                </button>
                <button class="btn share-btn" onclick="window.location.href='/share/user_id=${user.user_id}&area_id=${polygonId}'">
                    Ссылка
                </button>
            </div>

        </div>
        `;
    }

    return html;
}


