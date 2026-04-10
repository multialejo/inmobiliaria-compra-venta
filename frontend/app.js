const API_URL = 'http://localhost:3000/api/cantones';

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    const list = document.getElementById('cantones-list');
    list.innerHTML = '';
    data.forEach(canton => {
      const li = document.createElement('li');
      li.textContent = canton.nombre;
      list.appendChild(li);
    });
  })
  .catch(error => {
    document.getElementById('cantones-list').textContent = 'Error al cargar';
    console.error(error);
  });
