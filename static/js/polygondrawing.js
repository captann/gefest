function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function initPolygonDrawing() {

         let element = document.getElementById('h4_areas_error');
         if (element) {
            element.setAttribute('hidden', true);
         }
         document.getElementById("area-title").setAttribute('hidden', true);
         document.querySelector('.mode-switcher').style.display = 'none';
        if (document.getElementById('area-search')) {
        document.getElementById('area-search').style.display = 'none';
        }
        if (document.getElementById('add-area-btn')) {
        document.getElementById('add-area-btn').setAttribute('hidden', true)
        document.getElementById('area-scroll-progress-bar').style.display = 'none';
        }
        if (document.getElementById('areas-container')) {
        document.getElementById('areas-container').style.display = 'none';
        }
        const defaultColor = getRandomColor();
        document.getElementById('area-color').value = defaultColor;
        document.getElementById('area-message').style.display = 'block';
        document.getElementById('area-name').style.display = 'none';
        document.getElementById('area-buttons').style.display = 'none';
        document.getElementById('areas-create-container').style.display = 'block';

    let leafletMap = null;
    for (const key in window) {
        if (key.startsWith('map_') && window[key] instanceof L.Map) {
            leafletMap = window[key];
            break;
        }
    }

    if (!leafletMap) {
        console.warn("Карта Leaflet не найдена");
        return;
    }

    let drawnPolygon = null;
    const drawnItems = new L.FeatureGroup();
    leafletMap.addLayer(drawnItems);

    let drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems,
            remove: false
        },
        draw: {
            polygon: {
                shapeOptions: {
                    color: 'green',
                    weight: 3,
                    opacity: 0.5,
                    fillColor: 'green',
                    fillOpacity: 0.3
                }
            },
            marker: false,
            polyline: false,
            rectangle: false,
            circle: false,
            circlemarker: false
        }
    });

    leafletMap.addControl(drawControl);

    leafletMap.on('draw:created', function (e) {
        if (drawnPolygon) {
            drawnItems.removeLayer(drawnPolygon);
        }
        
        drawnPolygon = e.layer;
        drawnItems.addLayer(drawnPolygon);
        

        // Показываем поле ввода, убираем <h4>
        document.getElementById('area-message').style.display = 'none';
        document.getElementById('area-name').style.display = 'block';
        document.getElementById('area-buttons').style.display = 'block';
        
        document.getElementById('color-label').style.display = 'block';

            // Применяем выбранный цвет к полигону сразу
            const colorInput = document.getElementById('area-color');
            drawnPolygon.setStyle({
                color: colorInput.value,
                fillColor: colorInput.value
            });
            
            // Если пользователь меняет цвет вручную — полигон перекрашивается
            colorInput.addEventListener('input', () => {
                drawnPolygon.setStyle({
                    color: colorInput.value,
                    fillColor: colorInput.value
                });
            });

    });
    function addPolygonToMap(polygonData) {
     let leafletMap = null;
    for (const key in window) {
        if (key.startsWith('map_') && window[key] instanceof L.Map) {
            leafletMap = window[key];
            break;
        }
    }
    const existingLayer = leafletMap._layers[`polygon_${polygonData.polygon_id}`];
        if (existingLayer) {
            leafletMap.removeLayer(existingLayer);
        }
    const geoJsonData = {
        type: "Feature",
        properties: {
            polygon_id: polygonData.polygon_id, 
            color: polygonData.color,
            name: polygonData.polygon_name,
            checked: polygonData.checked
        },
        geometry: {
            type: "Polygon",
            coordinates: [polygonData.points.map(point => [point[0], point[1]])] 
        }
    };

    L.geoJSON(geoJsonData, {
        style: function(feature) {
            return {
                fillColor: feature.properties.color,
                color: feature.properties.color,
                weight: 1,
                fillOpacity: 0.5,
                opacity: 0.6
            };
        }
        // 
    }).addTo(leafletMap);   
    Object.values(leafletMap._layers).forEach(function(layer) {
        if (layer.feature && layer.feature.properties) {
            
            const id = String(layer.feature.properties.polygon_id);
            if (!polygonLayerMap[id]) {
                polygonLayerMap[id] = [];
                polygonLayerMap[id].push(layer);
            }
        }
    });
    polygonLayerMap[String(polygonData.polygon_id)][0].remove();
    alert('removed');
    updatePolygonVisibility(polygonData.polygon_id, false);
        
}
let oldButton = document.getElementById('save-area-btn');
let newButton = oldButton.cloneNode(true); // Клонируем элемент с его атрибутами, но без событий

oldButton.parentNode.replaceChild(newButton, oldButton); // Заменяем старый элемент на новый

// Теперь вешаем только нужный обработчик

newButton.addEventListener('click', function () {
    const button = this; // Ссылаемся на кнопку, по которой кликнули


    if (drawnPolygon) {
        let polygonCoordinates = drawnPolygon.getLatLngs()[0].map(latlng => ({
            lat: latlng.lat,
            lng: latlng.lng
        }));

        
        const colorInput = document.getElementById('area-color');
        const areaColor = colorInput ? colorInput.value : '#000000';

        const areaNameInput = document.getElementById('area-name');
        const areaName = areaNameInput ? areaNameInput.value.trim() : '';

        if (!areaName) {
            alert('Пожалуйста, введите название области!');
            button.disabled = false; // Включаем кнопку обратно
            return;
        }

        console.log('Sending request...');
        fetch('/save_area', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: areaName,
                color: areaColor,
                coordinates: polygonCoordinates
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Ошибка при сохранении области.');
            }
        })
        .then(data => {
            if (data.success) {
                showLoading();
                r = {};

                for (let cb in checkboxes) {
                    r[cb] = checkboxes[cb].checked;

                }

            fetch('/update_map', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(r)
            })
            .then(response => {
                if (response.ok) {
                    window.location.reload();
                } else {
                    return response.text().then(text => {
                        console.error('Ошибка:', text);
                        throw new Error('Сервер вернул ошибку');
                    });
                }
            })
            .catch(error => {
                console.error('Ошибка сети:', error);
                alert('Не удалось обновить карту.');
                if (leafletMap) {
                    leafletMap._container.style.display = 'block';
                }
                if (loadingMessage) {
                    loadingMessage.style.display = 'none';
                }
            });
                
            } else {
                alert(data.message);
                return;
            }
        })
        .catch(error => {
            console.error('Ошибка при отправке данных:', error);
            alert('Ошибка при отправке данных.');
        })
        .finally(() => {
            button.disabled = false; // Включаем кнопку обратно, даже если произошла ошибка
        });

        console.log('Сохраненный полигон:', polygonCoordinates);
        console.log('Название области:', areaName);
    } else {
        alert('Пожалуйста, нарисуйте полигон!');
        button.disabled = false; // Включаем кнопку обратно, если полигон не нарисован
    }
});

   document.getElementById('cancel-area-btn').addEventListener('click', function () {
    // Убираем нарисованный полигон с карты, если он есть
    document.getElementById('area-title').removeAttribute('hidden');
    if (document.getElementById('add-area-btn')) {
        document.getElementById('add-area-btn').removeAttribute('hidden');
    }
    if (document.querySelector('.mode-switcher')) {
        document.querySelector('.mode-switcher').style.display = 'flex';
    }

    if (drawnPolygon) {
        leafletMap.removeLayer(drawnPolygon);
        drawnPolygon = null;
    }

    // Удаляем контроль рисования, если он есть
    if (drawControl) {
        leafletMap.removeControl(drawControl);
        drawControl = null;
    }

    // Скрываем контейнер или любые элементы интерфейса
    document.getElementById('areas-create-container').style.display = 'none';
    document.getElementById('color-label').setAttribute('hidden', true);


    // Возвращаем интерфейс к изначальному состоянию
    document.getElementById('area-name').setAttribute('hidden', true)
    document.getElementById('area-name').value = "";
    if (document.getElementById('areas-container')) {
        document.getElementById('areas-container').style.display = 'block';
        }
    if (document.getElementById('area-search')) {
        document.getElementById('area-search').removeAttribute('hidden');
    }
});
}
