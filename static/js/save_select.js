document.addEventListener("DOMContentLoaded", function () {
  const select = document.getElementById("holding-filter");
  // Восстанавливаем значение из хэша, если есть
  if (window.location.hash) {
    const decoded = decodeURIComponent(window.location.hash.substring(1));
    console.log;
    if ([...select.options].some(option => option.value === decoded)) {
      select.value = decoded;
      let holdingFilter = document.getElementById('holding-filter');

    if (holdingFilter) {
        let selectedHolding = holdingFilter.value;
        let homeBlocks = document.querySelectorAll('.toggle-home-button');

        // Скрываем popup'ы и маркеры
        if (typeof hideMarkers === 'function') hideMarkers();

        if (selectedHolding === 'all') {
            if (typeof showMarkers === 'function') showMarkers();
        } else {
            if (typeof showSeveralMarkers === 'function') {
                showSeveralMarkers(selectedHolding, document.getElementById('address_type').value);
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

    }
  }

  // При изменении селекта обновляем хэш в URL
  select.addEventListener("change", function () {
    window.location.hash = encodeURIComponent(select.value);
  });
});