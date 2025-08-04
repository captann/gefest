window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('allAddressesContainer');
    const searchInput = document.getElementById('addressSearch');

    const allForms = []; // Сохраняем созданные формы

    allAddresses.forEach(address => {
        const originalStr = `${address.home_id} ${address.home_name} ${address.home_address}`;

        const formWrapper = document.createElement('div');
        formWrapper.dataset.search = originalStr;

        const form = createAddressForm(originalStr, address, true);
        formWrapper.appendChild(form);
        container.appendChild(formWrapper);
        allForms.push(formWrapper);
    });

    // Обработка поиска

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        let c = 0;
        allForms.forEach(wrapper => {
            const text = wrapper.dataset.search;
            if (text.includes(query.toLowerCase())) {
                wrapper.style.removeProperty('display');
            } else {
                wrapper.style.display = 'none';
            }
        });

    });
});
