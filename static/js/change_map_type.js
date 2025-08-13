let selector = document.getElementById('map-change-section');
function mapChange() {
    showLoading();
    window.location.href = selector.value;
}

selector.addEventListener('change', mapChange);