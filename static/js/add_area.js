function submitCode(code) {
    const nameField = document.getElementById('area-name');
    const name = nameField ? nameField.value.trim() : null;

    fetch(window.location.pathname, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code, name: name, link: window.location.pathname })
    })
    .then(response => response.json())
    .then(data => {
                    const toast = document.getElementById('copy-toast');

if (data.success) {
    toast.innerHTML = `<span style="color: #00e676;">&#10004;</span> ${data.message || 'Область добавлена'}`;
    toast.classList.remove('hidden');
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
        toast.classList.add('hidden');
        window.location.href = '/';
    }, 1000);
} else {
    toast.innerHTML = `<span style="color: #f44336;">&#10060;</span> ${data.message || 'Произошла ошибка'}`;
    toast.classList.remove('hidden');
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
        toast.classList.add('hidden');
    }, 2000);

    document.querySelectorAll('.help-class').forEach(el => el.value = '');
    document.querySelector('.help-class').focus();
}


    });
}

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.help-class');

    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            // Перейти к следующему, если введена цифра
            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }

            // Проверка на заполненность всех
            const code = Array.from(inputs).map(el => el.value).join('');

            if (code.length === 4) {
                submitCode(code);  // вызов твоей функции
            }
        });




        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    // Ставим фокус в первое поле
    inputs[0].focus();
});
