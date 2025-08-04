async function handleRoleChange(selectElement) {
    const userId = selectElement.dataset.userId;
    const originalRole = selectElement.dataset.originalRole;
    const newRole = selectElement.value;

    try {
        const response = await fetch('/update_role', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ [userId]: newRole })
        });

        const result = await response.json();

        if (result.success) {
            // Обновляем оригинальное значение роли
            selectElement.dataset.originalRole = newRole;
        } else {
            // Откатываем обратно к предыдущему значению
            selectElement.value = originalRole;
            alert(result.message || 'Ошибка при обновлении роли');
        }

    } catch (error) {
        selectElement.value = originalRole;
        alert('Произошла ошибка при отправке запроса');
        console.error(error);
    }
}
