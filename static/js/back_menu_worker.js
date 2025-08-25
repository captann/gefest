document.addEventListener("DOMContentLoaded", function () {
  const nav = document.getElementById("floatingNav");
  const rocket = document.getElementById("rocketButton");
  const toggle = document.getElementById("navToggle");

  // --- настройки поведения ---
  const BOTTOM_TOLERANCE = 2;   // допуск "дна" страницы в пикселях
  const DETACH_THRESHOLD = 10;  // на сколько пикселей нужно прокрутить вверх, чтобы вернуть "парящее" меню

  // --- состояние ---
  let lastScrollY = window.scrollY;
  let isAttachedBottom = false;
  let menuOpen = !nav.classList.contains("is-collapsed");

  // Сохраняем исходное место nav, чтобы вернуть назад
  const placeholder = document.createComment("floatingNav-anchor");
  nav.parentNode.insertBefore(placeholder, nav.nextSibling);

  function setState(open) {
    menuOpen = open;
    nav.classList.toggle("is-collapsed", !open);
    rocket.textContent = open ? icon : "🠕";
    rocket.style.color = "white";
    rocket.title = open ? "Вперёд!" : "Открыть меню";
    rocket.setAttribute("aria-expanded", String(open));

    // Иконка navToggle зависит от режима
    if (isAttachedBottom) {
      // Внизу страницы toggle играет роль ракеты
      toggle.textContent = open ? icon : "🠕";
      toggle.title = open ? "Вперёд!" : "Открыть меню";
    } else {
      // В "плавающем" режиме toggle — кнопка сворачивания/разворачивания
      toggle.textContent = open ? "🠗" : "🠕";
      toggle.title = open ? "Свернуть меню" : "Развернуть меню";
    }
  }

  function updateControlsVisibility() {
    if (isAttachedBottom) {
      rocket.style.display = "none"; // прячем внешнюю ракету
    } else {
      rocket.style.display = "";     // возвращаем внешнюю ракету
    }
  }

  function attachToBottom() {
    if (isAttachedBottom) return;
    // Переносим меню в конец body, чтобы оно было ниже контента и не перекрывало его
    document.body.appendChild(nav);
    nav.style.position = "static";   // встраиваем в поток документа
    isAttachedBottom = true;
    updateControlsVisibility();
    setState(menuOpen);              // обновляем заголовки/иконки с учётом режима
  }

  function detachFromBottom() {
    if (!isAttachedBottom) return;
    // Возвращаем меню на исходное место
    if (placeholder.parentNode) {
      placeholder.parentNode.insertBefore(nav, placeholder);
    }
    nav.style.position = "fixed";
    nav.style.bottom = "100px";
    nav.style.left = "20px";
    isAttachedBottom = false;
    updateControlsVisibility();
    setState(menuOpen);
  }

  // --- инициализация ---
  setState(menuOpen);
  updateControlsVisibility();

  // --- обработчики ---
  toggle.addEventListener("click", function (e) {
    if (isAttachedBottom) {
      // Внизу toggle = ракета
      if (!menuOpen) {
        e.preventDefault();
        setState(true);
      } else {
        window.location.href = "/";
      }
    } else {
      // В "парящем" режиме toggle сворачивает/разворачивает меню
      setState(!menuOpen);
    }
  });

  rocket.addEventListener("click", function (e) {
    if (!menuOpen) {
      e.preventDefault();
      setState(true);
    }
    // если меню открыто — обычный переход на "/"
  });

  function handleScroll() {
    const scrollY = window.scrollY;
    const winH = window.innerHeight;
    const docH = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );

    const atBottom = winH + scrollY >= docH - BOTTOM_TOLERANCE;

    if (atBottom) {
        setState(true);
      attachToBottom();
    } else {
      // вернём "парящее", только если прокрутили вверх достаточно
      if (isAttachedBottom && lastScrollY - scrollY > DETACH_THRESHOLD) {
        detachFromBottom();
      }
    }

    lastScrollY = scrollY;
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll);
  // вызвать один раз на старте (на случай маленьких страниц)
  handleScroll();
});
