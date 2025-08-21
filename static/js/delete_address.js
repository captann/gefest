const modal = document.getElementById("confirmationModal");
const cancelBtn = document.getElementById("cancelButton");
const confirmBtn = document.getElementById("confirmDeleteButton");
const overlay = document.querySelector(".modal-overlay");
const countdownText = document.getElementById("countdownText");

// Элементы, которые скрываем при открытии модалки
const floatingButton = document.querySelector(".floating-button");
const floatingNav = document.querySelector(".floating-nav");

let currentStuffId = null;
let countdownInterval = null;
let currentDiv = null;
// Функция открытия модалки
function confirmRemoving(stuff_id, div) {
    currentStuffId = stuff_id;
    currentDiv = div;
    modal.classList.add("show");

    // Скрываем кнопки и меню
    floatingButton.style.display = "none";
    floatingNav.style.display = "none";

    // Делаем кнопку неактивной
    confirmBtn.disabled = true;
    confirmBtn.classList.add("opacity-50", "cursor-not-allowed");

    let timeLeft = 5;
    countdownText.classList.remove("hidden");
    countdownText.textContent = `Удаление станет доступно через ${timeLeft} с`;
    confirmBtn.textContent = "Да, удалить";

    // Запускаем таймер
    countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            countdownText.textContent = `Удаление станет доступно через ${timeLeft} с`;
        } else {
            clearInterval(countdownInterval);
            countdownText.classList.add("hidden");
            confirmBtn.disabled = false;
            confirmBtn.classList.remove("opacity-50", "cursor-not-allowed");
            confirmBtn.textContent = "Да, удалить";
        }
    }, 1000);
}

// Функция закрытия модалки
function closeModal() {
    modal.classList.remove("show");
    currentStuffId = null;
    currentDiv = null;

    // Показываем скрытые элементы обратно
    floatingButton.style.display = "block";
    floatingNav.style.display = "flex";

    // Сбрасываем таймер
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// Кнопка "Отмена"
cancelBtn.addEventListener("click", closeModal);

// Клик по затемнению
overlay.addEventListener("click", closeModal);

// Подтверждение удаления
confirmBtn.addEventListener("click", () => {
    if (confirmBtn.disabled) return; // Не даём нажать раньше времени

    if (currentStuffId) {
        console.log("Удаляем адрес с id:", currentStuffId);
        sendAddressDelete(currentStuffId, currentDiv);
        // Здесь можно вызвать fetch или axios для удаления:
        // fetch(`/delete/${currentStuffId}`, { method: "DELETE" })
    }
});
