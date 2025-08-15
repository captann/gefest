/**
 * Вычисляет выпуклую оболочку (алгоритм Грэхема) и возвращает центр оболочки
 * @param {Array<[number, number]>} points - массив координат [lon, lat]
 * @returns {[number, number]} - центр оболочки [lon, lat]
 * @param {[number, number]} center - центр карты [lon, lat]
 * @returns {number} - рекомендованный zoom
 */
let checkboxes = {};
let initial_state = {};
let map_objs = {};



function find_map() {
    let leafletMap = null;
    for (const key in window) {
        if (key.startsWith('map_') && window[key] instanceof L.Map) {
            leafletMap = window[key];
                return leafletMap;
        }
    }
}

function get_random_color() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function get_central_point(points) {
      if (points.length < 3) {
          return [37.621184, 55.753600]
      };

      // Сортировка по X, потом по Y
      const sorted = points.slice().sort(([x1, y1], [x2, y2]) =>
        x1 === x2 ? y1 - y2 : x1 - x2
      );

      // Функция поворота
      function cross(o, a, b) {
        return (a[0] - o[0]) * (b[1] - o[1]) -
               (a[1] - o[1]) * (b[0] - o[0]);
      }

      // Построение нижней оболочки
      const lower = [];
      for (const p of sorted) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
          lower.pop();
        }
        lower.push(p);
      }

      // Построение верхней оболочки
      const upper = [];
      for (let i = sorted.length - 1; i >= 0; i--) {
        const p = sorted[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
          upper.pop();
        }
        upper.push(p);
      }

      // Объединение, убираем дублирующиеся крайние точки
      const convexHull = lower.slice(0, -1).concat(upper.slice(0, -1));

      // Вычисление центра тяжести (центроида)
      let sumLon = 0;
      let sumLat = 0;
      for (const [lon, lat] of convexHull) {
        sumLon += lon;
        sumLat += lat;
      }

      const centerLon = sumLon / convexHull.length;
      const centerLat = sumLat / convexHull.length;

      return [centerLon, centerLat];
}

function update_map_params(){
    let points = [];
    for (let polygon_id in polygonsData) {
        if (polygonsData[polygon_id]["checked"]) {
            for (let point of polygonsData[polygon_id]["points"]) {
                points.push(point);
            }
        }
    }
    let center = get_central_point(points);

    let zoom = calculate_zoom(center, points);
    return [center, zoom];
}

function calculate_zoom(center, points) {
    if (points.length < 3) {
          return 10;
      };
  const R = 6371; // Радиус Земли в км

  function toRad(deg) {
    return deg * Math.PI / 180;
  }

  // Вычисляем максимальное расстояние от центра до любой точки
  let maxDistanceKm = 0;

  for (const [lon, lat] of points) {
    const dLat = toRad(lat - center[1]);
    const dLon = toRad(lon - center[0]);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(center[1])) * Math.cos(toRad(lat)) *
              Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance > maxDistanceKm) {
      maxDistanceKm = distance;
    }
  }

  // Примерная таблица соответствия расстояния в км и zoom (Leaflet / Google Maps)
      const zoomByDistance = [
      { maxKm: 0.25, zoom: 18 },
      { maxKm: 0.5, zoom: 17 },
      { maxKm: 1, zoom: 16 },
      { maxKm: 2, zoom: 15 },
      { maxKm: 4, zoom: 14 },
      { maxKm: 9, zoom: 13 },
      { maxKm: 18, zoom: 12 },
      { maxKm: 35, zoom: 11 },
      { maxKm: 70, zoom: 10 },
      { maxKm: 150, zoom: 9 },
      { maxKm: 300, zoom: 8 },
      { maxKm: 600, zoom: 7 },
      { maxKm: 1200, zoom: 6 },
      { maxKm: 2500, zoom: 5 },
      { maxKm: 5000, zoom: 4 },
      { maxKm: 10000, zoom: 3 },
      { maxKm: 20000, zoom: 2 }
    ];


  // Находим подходящий zoom
  for (const entry of zoomByDistance) {
    if (maxDistanceKm <= entry.maxKm) {
      return entry.zoom;
    }
  }

  return 2; // fallback — самый отдалённый
}

function get_checkboxes() {
    let checkboxes = document.querySelectorAll('.area-checkbox');
    let checkboxMap = {};
    checkboxes.forEach(checkbox => {
      let areaId = checkbox.dataset.areaId;
      checkboxMap[areaId] = checkbox;
    });
    return checkboxMap;
}

function create_polygon(polygon_id, color, polygon_name, checked, points) {

    const geoJsonData = {
        type: "Feature",
        properties: {
            polygon_id: polygon_id,
            color: color,
            name: polygon_name,
            checked: checked
        },
        geometry: {
            type: "Polygon",
            coordinates: [points.map(point => [point[0], point[1]])]
        }
    };
    let layer = L.geoJSON(geoJsonData, {
        style: function(feature) {
            return {
                fillColor: feature.properties.color,
                color: feature.properties.color,
                weight: 1,
                fillOpacity: 0.5,
                opacity: 0.6
            };
        }
    });
    map_objs[polygon_id] = layer;
}

function update_visibility(polygon_id, init = false) {
    const checkbox = checkboxes[polygon_id];
    const map = find_map();
    if (!checkbox) return;
    if (checkbox.checked) {
        polygonsData[polygon_id]["checked"] = 1;
        map_objs[polygon_id].addTo(map);
    } else {
        polygonsData[polygon_id]["checked"] = 0;
        if (!init) {
            map_objs[polygon_id].remove();
        }
    }

    if (!init) {
        const [center, zoom] = update_map_params();
        map.setView([center[1], center[0]], zoom);
    }
}

function init_polygons() {
    initial_state = polygonsData;
    for (let polygon_id in polygonsData) {
        create_polygon(polygon_id, polygonsData[polygon_id]["color"], polygonsData[polygon_id]["name"], polygonsData[polygon_id]["checked"], polygonsData[polygon_id]["points"]);
        update_visibility(polygon_id, init=true);
        let checkbox = document.querySelector(`[data-area-id="${polygon_id}"]`);
        if (checkbox) {

            checkbox.addEventListener("change", () => update_visibility(polygon_id));
        }
    }
    let [center, zoom] = update_map_params();
    find_map().setView([center[1], center[0]], zoom);

}


function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
  };
  function compareStates(a, b) {
      return Object.keys(a).length === Object.keys(b).length &&
          Object.keys(a).every(k => a[k] === b[k]);
}

function compare_state (obj) {
    if (obj.id == "areas-mode")
     {
        let finalAreaState = polygonsData;
        if (!compareStates(initial_state, finalAreaState)) {
            let leafletMap = find_map();
            showLoading();
            hideMarkers();
            fetch('/update_map', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalAreaState)
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
        }
    }
}
 // Функция переключения между контейнерами


function delete_area(e) {

        const areaId = e.dataset.areaId;
        console.log(areaId);
        if (confirm("Удалить эту область?")) {
            if (window.highlightedPolygon && Number(window.highlightedPolygon.options.areaId) === Number(areaId)) {
                let leafletMap = find_map();

                find_map().removeLayer(highlightedPolygon);
                    highlightedPolygon = null;
                }
                fetch('/delete_area', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        polygon_id: areaId
                    })
                })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Ошибка при удалении.');
                        }
                    })
                    .then(data => {
                        if (data.success) {
                            showLoading();
                            hideMarkers();
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
                            document.getElementById('areas-container').innerHTML = data.list;

                            const cancelBtn = document.getElementById('cancel-area-btn');

                        } else {
                            alert('Ошибка при сохранении области.');
                        }
                    })
                    .catch(error => {
                        console.error('Ошибка при отправке данных:', error);
                        alert('Ошибка при отправке данных.');
                    });
            }

}

function toggleContainers() {
    const tasksContainer = document.getElementById('tasks-container');
    const areasContainer = document.getElementById('areas-container');
    if (document.getElementById('tasks-mode').checked) {
        tasksContainer.style.display = 'flex';
        document.getElementById("area-title").setAttribute("hidden", true);
        document.getElementById("area-search").setAttribute("hidden", true);

        areasContainer.style.display = 'none';
        let element = document.getElementById('h4_areas_error');
        if (element) {
            element.setAttribute('hidden', true);
        }
        element = document.getElementById('h4_tasks_error');
        if (element) {
            element.removeAttribute('hidden');
        }
        document.getElementById('add-area-btn').setAttribute('hidden','true');

        area_progressBar.style.display = 'none';

    } else
    {
        tasksContainer.style.display = 'none';
        areasContainer.style.display = 'block';
        let element = document.getElementById('h4_tasks_error');
        if (element) {
            element.setAttribute('hidden', true);
        }
        element = document.getElementById('h4_areas_error');
        if (element) {
            element.removeAttribute('hidden');
        }
        document.getElementById("area-title").removeAttribute("hidden");

        hideMarkers();
        document.getElementById('add-area-btn').setAttribute('hidden','true')
        document.getElementById('add-area-btn').removeAttribute('hidden')
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderPolygonsList();

    checkboxes = get_checkboxes();
    toggleContainers();
    init_polygons();

});

  function enterMapMode(obj) {
  const [center, zoom] = update_map_params();
        find_map().setView([center[1], center[0]], zoom);
    if (obj.id !== "tasks-mode") {
        renderPolygonsList();
        let r = {};

            for (let cb in checkboxes) {
                r[cb] = checkboxes[cb].checked;

            }
        initialAreaState = r;
        toggleContainers();


    }
    else {
        document.getElementById("area-search").setAttribute("hidden", true);
        document.getElementById("areas-container").setAttribute("hidden", true);
            r = {};
            for (let cb in checkboxes) {
                r[cb] = checkboxes[cb].checked;
            }
            finalAreaState = r;
            if (window.highlightedPolygon) {
                find_map().removeLayer(window.highlightedPolygon);
                window.highlightedPolygon = null;
                const [center, zoom] = update_map_params();
                find_map().setView([center[1], center[0]], zoom);
            }
        if (!compareStates(initialAreaState, finalAreaState)) {
            let leafletMap = null;
            for (const key in window) {
                if (key.startsWith('map_') && window[key] instanceof L.Map) {
                    leafletMap = window[key];
                    break;
                }
            }

            showLoading();
            hideMarkers();


            // Создаем FormData и добавляем finalAreaState

            fetch('/update_map', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalAreaState)
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
        }
        else {
            holdingFilter = document.getElementById('holding-filter');
            if (holdingFilter) {

                        selectedHolding = holdingFilter.value;
                        homeBlocks = document.querySelectorAll('.toggle-home-button');




                        // Скрываем popup'ы и маркеры
                        if (typeof hideMarkers === 'function') hideMarkers();

                        if (selectedHolding === 'all') {
                            if (typeof showMarkers === 'function') showMarkers();
                        } else {
                            if (typeof showSeveralMarkers === 'function') {
                                showSeveralMarkers(selectedHolding);
                            }
                        }

                        // Фильтрация списка задач
                        homeBlocks.forEach(button => {
                            const homeHolding = button.getAttribute('holding');
                            const shouldShow = selectedHolding === 'all' || homeHolding === selectedHolding;
                            button.parentElement.style.display = shouldShow ? 'block' : 'none';
                        });

                        // Подсветка select
                        if (selectedHolding !== 'all') {
                            holdingFilter.style.boxShadow = '0 0 8px 2px rgb(255, 126, 0)';
                            holdingFilter.style.borderRadius = '5px';
                        } else {
                            holdingFilter.style.boxShadow = 'none';
                        }
                    }




             toggleContainers();

        }
    }
}

window.highlightedPolygon = null;  // Ссылка на выделенный полигон
let area = null;
function focusOnArea(areaName) {
    area = polygonsData[areaName];
    if (!area) {
        console.error(`Область ${areaName} не найдена`);
        return;
    }
    let  coords = area.points.map(([lon, lat]) => [lat, lon]);
    let leafletMap = find_map();
    if (highlightedPolygon && highlightedPolygon.options.areaId === areaName) {
            leafletMap.removeLayer(highlightedPolygon);
            highlightedPolygon = null;

            const [center, zoom] = update_map_params();
            leafletMap.setView([center[1], center[0]], zoom);
            return;

    }
    // Удаляем старый полигон, если есть
    if (highlightedPolygon) {
        leafletMap.removeLayer(highlightedPolygon);
    }

    // Рисуем новый полигон
    highlightedPolygon = L.polygon(coords, {
        color: '#ff7e00',
        weight: 3,
        fill: true,
        fillColor: '#ff7e00',
        fillOpacity: 0.2
    }).addTo(leafletMap);
    highlightedPolygon.options.areaId = areaName;

    leafletMap.fitBounds(highlightedPolygon.getBounds())

}

window.toggleDescription = function(taskId) {
    // Копируем taskId в буфер
    const desc = document.getElementById('desc-' + taskId);
        desc.style.display = desc.style.display === 'none' ? 'block' : 'none';
    text = `ID скопирован`;
    navigator.clipboard.writeText(taskId).then(() => {
        showCopyNotification(text);
    }).catch(() => {
        showCopyNotification('❌ Не удалось скопировать ID', true);
    });
};

function copyAddress(text) {
navigator.clipboard.writeText(text).then(() => {
        showCopyNotification("Адрес скопирован");
    }).catch(() => {
        showCopyNotification('❌ Не удалось скопировать ID', true);
    });
}
// Универсальный показ уведомления
function showCopyNotification(message, isError = false) {
    const note = document.createElement('div');
    note.textContent = message;

    note.style.position = 'fixed';
    note.style.bottom = '30px';
    note.style.right = '30px';
    note.style.backgroundColor = isError ? '#b00020' : '#00bfa6';
    note.style.color = 'white';
    note.style.padding = '12px 20px';
    note.style.borderRadius = '6px';
    note.style.fontSize = '14px';
    note.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    note.style.zIndex = '9999';
    note.style.opacity = '1';
    note.style.transition = 'opacity 0.5s ease';

    document.body.appendChild(note);

    // Удаление через 3 секунды с анимацией
    setTimeout(() => {
        note.style.opacity = '0';
        setTimeout(() => {
            note.remove();
        }, 500);
    }, 1500);
}
