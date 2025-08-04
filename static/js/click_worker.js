let opened = {}; // home_id: true/false
window.searching = false;

document.addEventListener('DOMContentLoaded', () => {
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;

    tasksList.addEventListener('click', function (e) {
        if (e.target.matches('input[type="checkbox"]')) return;

        const toggleBtn = e.target.closest('.toggle-home-button');
        if (!toggleBtn) return;

        const home_id = toggleBtn.getAttribute('data-home-id');
        if (!home_id) {
            console.warn('Не найден home_id у адреса');
            return;
        }

        const marker = findMarkerByHomeId(home_id);
        const leafletMap = find_map();

        if (!marker || !leafletMap) return;

        leafletMap.flyTo(marker.getLatLng(), leafletMap.getZoom(), {
            duration: 0.5,
            easeLinearity: 0.25
        });

       const popupIsOpen = opened[home_id];

        if (popupIsOpen) {
            leafletMap.closePopup(marker.getPopup());
            opened[home_id] = false;

            // Закрываем список задач, если не в режиме поиска
            if (!window.searching) {
                const container = toggleBtn.nextElementSibling;
                if (container) container.style.display = 'none';
            }
        } else {
            const newContent = generatePopupContent(homes[home_id], tasks[home_id]);
            marker.setPopupContent(newContent);
            marker.openPopup();
            opened[home_id] = true;

            // Показываем задачи только если не в режиме поиска
            if (!window.searching) {
                const container = toggleBtn.nextElementSibling;
                if (container) container.style.display = 'block';
            }
        }


        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('taskClicked', home_id);
        }
    });
});
