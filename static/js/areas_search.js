function areas_search() {
    const searchValue = document.getElementById('area-search').value.toLowerCase();
    if (!searchValue) {
            const [center, zoom] = update_map_params();
            find_map().setView([center[1], center[0]], zoom);
        }
    document.querySelectorAll('.area-item').forEach(item => {
        const name = item.querySelector('.area-name').textContent.toLowerCase();

        if (name.includes(searchValue)) {
            item.style.display = 'flex';

        } else {
            item.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('area-search').addEventListener('input', function(e) {
        areas_search();
    });

});