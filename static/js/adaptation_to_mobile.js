let prevWidth = window.innerWidth;
let prevHeight = window.innerHeight;
document.addEventListener("DOMContentLoaded", () => {
  function adaptToMobile() {
    const isMobile = window.innerWidth < 1000;
    const mainContainer = document.getElementById("main-container");
    const sidePanel = document.getElementById("blok_pannel");
    const resizer = document.getElementById("resizer");
    const mapContainer = document.getElementById("map_");

    let toggleBtn = document.getElementById("toggleViewBtn");
    let myLocationBtn = document.getElementById("myLocationBtn");
    const heightDiff = Math.abs(window.innerHeight - prevHeight);

      // Если изменяется только высота (например, при появлении клавиатуры), не трогаем layout


      prevWidth = window.innerWidth;
      prevHeight = window.innerHeight;
if (!toggleBtn) {
    toggleBtn = document.createElement("button");
    toggleBtn.id = "toggleViewBtn";
    toggleBtn.textContent = "≡";
    toggleBtn.style.position = "fixed";
    toggleBtn.style.top = "65px";
    toggleBtn.style.right = "25px";
    toggleBtn.style.zIndex = "9999";
    toggleBtn.style.background = "rgba(255, 255, 255, 0.9)";
    toggleBtn.style.border = "none";
    toggleBtn.style.borderRadius = "4px";
    toggleBtn.style.padding = "10px 18px";       // ⬅ увеличено
    toggleBtn.style.fontSize = "24px";           // ⬅ увеличено
    toggleBtn.style.cursor = "pointer";
    toggleBtn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";

    document.body.appendChild(toggleBtn);
}
if (!myLocationBtn) {
    myLocationBtn = document.createElement("button");
    myLocationBtn.id = "myLocationBtn";
    myLocationBtn.textContent = "⚐";
    myLocationBtn.style.position = "fixed";
    myLocationBtn.style.bottom = "65px";
    myLocationBtn.style.right = "25px";
    myLocationBtn.style.zIndex = "9999";
    myLocationBtn.style.background = "rgba(255, 255, 255, 0.9)";
    myLocationBtn.style.border = "none";
    myLocationBtn.style.borderRadius = "4px";
    myLocationBtn.style.padding = "10px 18px";       // ⬅ увеличено
    myLocationBtn.style.fontSize = "24px";           // ⬅ увеличено
    myLocationBtn.style.cursor = "pointer";
    myLocationBtn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";

    document.body.appendChild(myLocationBtn);
}



    let showingPanel = false;

  if (!mapContainer) {
    console.warn("map_ не найден!");
  }
    if (isMobile) {


       document.body.classList.add("mobile-map", "mobile-panel");

      // Прячем боковую панель и ресайзер
      if (sidePanel) {
        sidePanel.style.width = "0%";
        sidePanel.style.display = "block";
      }
      if (resizer) resizer.style.display = "none";

      // Растягиваем карту
      if (mapContainer) {
        mapContainer.style.width = "100%";
        mapContainer.style.height = "100%";
        mapContainer.style.position = "absolute";
        mapContainer.style.top = "0";
        mapContainer.style.left = "0";
        mapContainer.style.right = "0";
        mapContainer.style.bottom = "0";
        mapContainer.style.zIndex = "0";
      }

      // Назначаем обработчик на кнопку ≡
      // Обновим стиль панели
        sidePanel.style.position = "absolute";
        sidePanel.style.top = "0";
        sidePanel.style.left = "0";
        sidePanel.style.height = "100%";
        sidePanel.style.zIndex = "998";
        sidePanel.style.transition = "transform 0.3s ease-in-out";
        // ДОБАВЬ ВОТ ЭТИ СТРОКИ:
        sidePanel.style.minWidth = "100vw";
        sidePanel.style.maxWidth = "100vw";
        sidePanel.style.width = "100vw";
          if (toggleBtn) toggleBtn.style.display = "block";



        // Начнём со скрытой панели
        sidePanel.style.transform = "translateX(-100%)";
        myLocationBtn.onclick = (e) => {
            showMe(e);
        }

        toggleBtn.onclick = () => {
          if (showingPanel) {
            sidePanel.style.transform = "translateX(-100%)"; // спрятать
            if (myLocationBtn) {
            myLocationBtn.style.display = "block";
            }
          } else {
            sidePanel.style.transform = "translateX(0)"; // показать
            if (myLocationBtn) {
            myLocationBtn.style.display = "none";
            }
          }
          showingPanel = !showingPanel;

          if (window.map && typeof window.map.invalidateSize === 'function') {
            setTimeout(() => window.map.invalidateSize(), 300);
          }
        };




    }  else {
    document.body.classList.remove("mobile-map", "mobile-panel");
    sidePanel.style.display = 'block';

  // Десктопный режим
  if (sidePanel) {
    sidePanel.style.display = "flex";
    sidePanel.style.position = "";
    sidePanel.style.transform = "";
    sidePanel.style.minWidth = "";
    sidePanel.style.maxWidth = "";
    sidePanel.style.width = "";
    sidePanel.style.height = "";
    sidePanel.style.zIndex = "";
    sidePanel.style.transition = "";
  }

  if (resizer) resizer.style.display = "block";

  if (mapContainer) {
    mapContainer.style.position = "";
    mapContainer.style.width = "";
    mapContainer.style.height = "";
    mapContainer.style.zIndex = "";
  }

  if (toggleBtn) toggleBtn.style.display = "none";
  if (myLocationBtn) myLocationBtn.style.display = "none";
}


    // Обновляем размер карты
    if (window.map && typeof window.map.invalidateSize === 'function') {
      setTimeout(() => window.map.invalidateSize(), 300);
    }
  }

  // Вызов при загрузке
  adaptToMobile();

  // Вызов при ресайзе окна
  //window.addEventListener("resize", adaptToMobile);


function resetViewportAfterInput(e) {
  const target = e.target;

  // Проверяем, что это input[type="text"]
  if (target.tagName === "INPUT" && target.type === "text") {
    setTimeout(() => {
      // Сброс scroll
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

      // Сброс transform (если что-то сдвинулось)
      document.body.style.transform = "none";
      document.documentElement.style.transform = "none";

      // Ширину жёстко фиксируем
      document.body.style.width = "100vw";
      document.documentElement.style.width = "100vw";

      // Отключаем X-прокрутку
      document.body.style.overflowX = "hidden";
      document.documentElement.style.overflowX = "hidden";

      // Обновляем карту
      if (window.map && typeof window.map.invalidateSize === "function") {
        window.map.invalidateSize();
      }
    }, 300); // ждём закрытия клавиатуры
  }
}

window.addEventListener("focusout", resetViewportAfterInput);


window.addEventListener("focusout", resetViewportAfterInput);

});