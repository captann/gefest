
const main_page = document.getElementById('main_page');
  if (window.innerWidth <= 1000) {
    main_page.src = '/static/img/main_page_mobile.png';
    document.getElementById("control_pannel").src = "/static/img/control_pannel.png"
  } else {
    document.getElementById("control_pannel").remove();
    main_page.src = '/static/img/main_page.png';
  }
const popup = document.getElementById('popup');
popup.src = '/static/img/popup.png';
const tasklist = document.getElementById('tasklist');
tasklist.src = '/static/img/tasklist.png';
const arealist = document.getElementById('arealist');
arealist.src = '/static/img/arealist.png';
const add_area = document.getElementById('add_area');
add_area.src = '/static/img/add_area.png';
const add_area2 = document.getElementById('add_area2');
add_area2.src = '/static/img/add_area_2.png';
const focuses = document.getElementById('focuses');
focuses.src = '/static/img/focuses_area.png';

// share_area
const share_area = document.getElementById('share_area');
share_area.src = '/static/img/share_page.png';