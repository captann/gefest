const normalize = s => s?.trim().replace(/\s+/g, ' ');

function filtring() {
    let searchInput = document.getElementById('search-input');
    let searchType = document.getElementById('search-type');

    if (!searchInput || !searchType) {
        console.warn('search-input или search-type не найдены в DOM');
        return;
    }

    searchInput.addEventListener('input', function(e) {
        const searchValue = e.target.value.toLowerCase();
        const searchTypeValue = searchType.value;

        const homeBlocks = document.querySelectorAll('.toggle-home-button');
        const taskContainers = document.querySelectorAll('.task-container');
        const taskItems = document.querySelectorAll('.task-item');

        if (!searchValue) {
            const [center, zoom] = update_map_params();
            find_map().setView([center[1], center[0]], zoom);
            taskContainers.forEach(container => container.style.display = 'none');
            taskItems.forEach(item => item.style.display = 'block');
            homeBlocks.forEach(button => button.parentElement.style.display = 'block');
            return;
        }

        if (searchTypeValue === 'address') {
            homeBlocks.forEach(button => {
                const addressText = button.textContent.toLowerCase();
                const matches = addressText.includes(searchValue);

                button.parentElement.style.display = matches ? 'block' : 'none';
                const container = button.nextElementSibling;
                if (container) container.style.display = 'none';
            });
        } else if (searchTypeValue === 'id') {
            window.searching = true;

            // Закрыть все popup'ы перед новым поиском
            for (const home_id in opened) {
                if (opened[home_id]) {
                    const marker = findMarkerByHomeId(home_id);
                    const leafletMap = find_map();
                    if (marker && leafletMap) {
                        leafletMap.closePopup(marker.getPopup());
                        opened[home_id] = false;
                    }
                }
            }

            taskItems.forEach(item => item.style.display = 'none');
            taskContainers.forEach(container => container.style.display = 'none');
            homeBlocks.forEach(button => button.parentElement.style.display = 'none');

            taskItems.forEach(item => {
                const id = item.dataset.id?.toLowerCase();
                if (id && id.includes(searchValue)) {
                    item.style.display = 'block';

                    const taskContainer = item.closest('.task-container');
                    if (taskContainer) {
                        taskContainer.style.display = 'block';

                        const toggleButton = taskContainer.previousElementSibling;
                        if (toggleButton?.classList.contains('toggle-home-button')) {
                            toggleButton.parentElement.style.display = 'block';

                            const home_id = toggleButton.getAttribute('data-home-id');
                            if (home_id) {
                                opened[home_id] = false;
                                if (taskContainer.style.display === 'none') {
                                    toggleButton.click();
                                }
                            }
                        }
                    }
                }
            });
        }
    setTimeout(() => {
    window.searching = false;
}, 100);

    });
     let holdingFilter = document.getElementById('holding-filter');
     let addressType = document.getElementById('address_type');
     function changer() {

        let selectedHolding = holdingFilter.value;
        let homeBlocks = document.querySelectorAll('.toggle-home-button');

        // Скрываем popup'ы и маркеры
        if (typeof hideMarkers === 'function') hideMarkers();

        if ((selectedHolding === 'all') && (addressType.value === 'ALL')) {
            if (typeof showMarkers === 'function') showMarkers();
        } else {
            if (typeof showSeveralMarkers === 'function') {
                showSeveralMarkers(selectedHolding, addressType.value);
                console.log(addressType.value);
            }
        }

        // Фильтрация списка задач
        homeBlocks.forEach(button => {
            const homeHolding = button.getAttribute('holding');
            const homeStatus = button.getAttribute('status');
            const shouldShow = (selectedHolding === 'all' || homeHolding === selectedHolding) && (addressType.value == 'ALL' || addressType.value === homeStatus);
            button.parentElement.style.display = shouldShow ? 'block' : 'none';
        });

        // Подсветка select
        if (selectedHolding !== 'all') {
            holdingFilter.style.boxShadow = '0 0 8px 2px rgb(255, 126, 0)';
            holdingFilter.style.borderRadius = '5px';
        } else {
            holdingFilter.style.boxShadow = 'none';
        }
        if (addressType.value !== 'ALL') {
            addressType.style.boxShadow = '0 0 8px 2px rgb(255, 126, 0)';
            addressType.style.borderRadius = '5px';
        } else {
            addressType.style.boxShadow = 'none';
        }
    }

    if (holdingFilter) {
        holdingFilter.addEventListener('change', changer);
    }
    if (addressType) {
        addressType.addEventListener('change', changer);
    }





}
document.addEventListener('DOMContentLoaded', filtring);
