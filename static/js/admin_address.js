
function createAddressForm(originalStr, fields = {}, isFullForm = false, isFromMainList=false) {
    const div = document.createElement('div');
    div.style.marginTop = '20px';
    div.style.padding = '15px';
    div.style.background = '#2a2a2a';
    div.style.border = '1px solid #444';
    div.style.borderRadius = '10px';

    const title = document.createElement('p');

    let linkText = '';
    let linkHref = '';

    if (isFullForm) {
        // Убираем ID из строки
        const parts = originalStr.split(' ');
        const searchText = encodeURIComponent(parts.slice(1).join(' '));
        linkText = parts.slice(1).join(' ');
        linkHref = `https://yandex.ru/maps/?text=${searchText}`;
    } else {
        // Ищем по всей строке (включая ID)
        const searchText = encodeURIComponent(originalStr);
        linkText = originalStr;
        linkHref = `https://yandex.ru/search/?text=${searchText}`;
    }

   const link = document.createElement('a');
link.href = linkHref;
link.target = '_blank';
link.rel = 'noopener noreferrer';
link.textContent = `Исходная строка: ${linkText}`;
link.classList.add('source-link'); // 👈 добавляем класс

title.appendChild(link);

    div.appendChild(title);



    const fieldMap = isFullForm
        ? { home_id: 'ID', home_name: 'Название', home_address: 'Адрес', latlon: 'Координаты (широта, долгота)' }
        : { home_id: 'ID', home_name: 'Название', home_address: 'Адрес', latlon: 'Координаты (широта, долгота)' };

    const inputRefs = {};

    for (const key in fieldMap) {


    // Особая обработка поля latlon
    if (key === 'latlon') {
    const label = document.createElement('label');
    label.textContent = fieldMap[key];
    label.style.display = 'block';

    const combinedInput = document.createElement('input');
    combinedInput.type = 'text';
    combinedInput.name = 'latlon';
    combinedInput.value = (
    typeof fields.lat === 'number' && typeof fields.lon === 'number'
    ) ? `${fields.lat}, ${fields.lon}` : '';


    combinedInput.style.width = '100%';
    combinedInput.style.marginTop = '5px';
    combinedInput.style.marginBottom = '10px';
    combinedInput.style.display = 'block';
    combinedInput.style.padding = '8px';
    combinedInput.style.background = '#333';
    combinedInput.style.border = '1px solid #555';
    combinedInput.style.borderRadius = '5px';
    combinedInput.style.color = '#fff';

    inputRefs['latlon'] = combinedInput;
    combinedInput.placeholder = fieldMap[key];
    const coordinatePattern = /^\s*-?\d{1,3}(?:\.\d+)?\s*,\s*-?\d{1,3}(?:\.\d+)?\s*$/;


    label.appendChild(combinedInput);
    div.appendChild(label);
    continue;
}


    // Обычное поле
    const label = document.createElement('label');
    label.textContent = fieldMap[key];

    const input = document.createElement('input');
    input.type = 'text';
    input.name = key;
    input.placeholder = fieldMap[key];
    input.value = fields[key] !== undefined ? fields[key] : '';
    input.disabled = isFullForm && key === 'home_id';
    if (key === 'home_id') {
            input.type = 'number';
            input.step = '1';            // Только целые числа
            input.min = '1';
                      input.addEventListener('input', () => {
                // Удаляем всё, кроме цифр
                input.value = input.value.replace(/\D/g, '');
            });// Только положительные
    }


    input.style.marginBottom = '10px';
    input.style.display = 'block';
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.background = '#333';
    input.style.border = '1px solid #555';
    input.style.borderRadius = '5px';
    input.style.color = '#fff';

    inputRefs[key] = input;

    div.appendChild(label);
    div.appendChild(input);
}


    // Карта, если есть координаты
    // Добавляем карту всегда
    const mapWrapper = document.createElement('div');
    const mapId = `mini_map_${Math.random().toString(36).substring(2, 9)}`;
    mapWrapper.id = mapId;

    mapWrapper.style.width = '100%';
    mapWrapper.style.height = '400px';
    mapWrapper.style.marginTop = '10px';
    mapWrapper.style.border = '1px solid #555';
    mapWrapper.style.borderRadius = '8px';
    mapWrapper.style.overflow = 'hidden';
    mapWrapper.style.display = 'none'; // по умолчанию скрыта

    div.appendChild(mapWrapper);

    const errorMsg = document.createElement('p');
    errorMsg.style.color = 'red';
    errorMsg.style.marginTop = '10px';
    errorMsg.style.display = 'none';
    errorMsg.textContent = '❗ Невалидные координаты. Укажите в формате: 55.75, 37.61';
    div.appendChild(errorMsg);

    setTimeout(() => {
        const miniMap = L.map(mapId, {
            attributionControl: false,
            zoomControl: true
        }).setView([55.75, 37.61], 10); // дефолтный центр
        /* https://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}*/
        /* https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png */
        L.tileLayer('https://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(miniMap);

        let currentMarker = null;
        const latlonInput = inputRefs['latlon'];

        function updateMarker(newLat, newLon) {
            if (currentMarker) miniMap.removeLayer(currentMarker);

            currentMarker = createMarker(miniMap, [newLon, newLat], fields, inputRefs);


            miniMap.setView([newLat, newLon], 17);
        }

        // при blur проверяем валидность
        latlonInput.addEventListener('input', () => {
    const allowed = "0123456789.,- ";
    let val = latlonInput.value;
    let filtered = '';

    let dotCount = 0;
    let commaCount = 0;

    for (let ch of val) {
        if (!allowed.includes(ch)) continue;

        if (ch === '.') {
            if (dotCount >= 2) continue;
            dotCount++;
        }

        if (ch === ',') {
            if (commaCount >= 1) continue;
            commaCount++;
        }

        filtered += ch;
    }

    if (val !== filtered) {
        const pos = latlonInput.selectionStart - 1;
        latlonInput.value = filtered;
        latlonInput.setSelectionRange(pos, pos);
    }
});

        latlonInput.addEventListener('blur', () => {
            const [latStr, lonStr] = latlonInput.value.split(',').map(s => s.trim());
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);
            const isValid = !isNaN(lat) && !isNaN(lon);

            if (isValid) {
                fields.lat = lat;
                fields.lon = lon;
                errorMsg.style.display = 'none';
                mapWrapper.style.display = 'block';
                requestAnimationFrame(() => {
                    miniMap.invalidateSize();
                    miniMap.setView([lat, lon], 17);
                });
                updateMarker(lat, lon);

            } else {
                mapWrapper.style.display = 'none';
                errorMsg.style.display = 'block';
            }
        });

        // если изначально координаты валидные — отобразим карту
        const [initialLat, initialLon] = [`${fields.lat}`, `${fields.lon}`];
        if (!isNaN(parseFloat(initialLat)) && !isNaN(parseFloat(initialLon))) {
            mapWrapper.style.display = 'block';
            updateMarker(parseFloat(initialLat), parseFloat(initialLon));
        }

        requestAnimationFrame(() => {
            miniMap.invalidateSize();
        });
    }, 0);


    if (user_role_weight > 1) {
        const submitBtn = document.createElement('button');
        submitBtn.textContent = "Применить";
        submitBtn.type="button";
        submitBtn.style.marginTop = '10px';

        submitBtn.addEventListener('click', () => {
            sendAddressUpdate(inputRefs, div, isFullForm, isFromMainList, isFullForm);
        });
        div.appendChild(submitBtn);
    }


    return div;
}


function generatePopupContent(homeData) {
    const { home_id, home_name, home_address } = homeData;
     return `
    <div style='width: 400px; max-height: 700px; overflow-y: auto;'>
        <h4 style='margin-bottom: 5px;'>${home_name}</h4>
        <p style='margin-top: 0; color: #0078d4;'>${home_address}</p>
        <hr style='margin: 10px 0;'>
    </div>
`;
}

function createMarker(map, coords, fields, inputRefs = null) {
    const { home_id } = fields;

    const markerHtml = `
        <div id="marker-${home_id}" style="
            width: 28px;
            height: 28px;
            background-color: blue;
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
    });

    // Устанавливаем попап при открытии
    marker.bindPopup(() => {
    let id = fields.home_id;
    let name = fields.home_name || '';
    let address = fields.home_address || '';

    // Если inputRefs есть, берём актуальные значения из формы
    if (inputRefs) {
        id = inputRefs['home_id']?.value || id;
        name = inputRefs['home_name']?.value || name;
        address = inputRefs['home_address']?.value || address;
    }

    return `
        <b>ID:</b> ${id}<br>
        <b>Название:</b> ${name}<br>
        <b>Адрес:</b> ${address}
    `;
});


    marker.addTo(map);

    return marker;
}
