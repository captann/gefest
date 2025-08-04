function showLoading() {
  document.getElementById('loading-overlay').classList.remove('hidden');
  document.getElementById('main-container').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
  setTimeout(() => {
    document.getElementById('main-container').style.display = 'block';
  }, 300); // чуть подождать пока исчезнет
}
