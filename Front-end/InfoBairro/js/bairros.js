function adminCard() {
  const adminTela = document.getElementById("admin");
  const adminButton = document.getElementsByClassName("adminCardOpt")[0];
  const hiddenEls = document.getElementsByClassName("hidden");

  // adiciona animação de saída
  adminTela.classList.remove("fade-inX");
  adminTela.classList.add("fade-outX");

  setTimeout(() => {
    if (adminButton.style.display !== "none") {
      // esconde botão, mostra os hidden
      adminButton.style.display = "none";
      for (let i = 0; i < hiddenEls.length; i++) {
        hiddenEls[i].style.display = "block";
      }
    } else {
      // mostra botão, esconde os hidden
      adminButton.style.display = "block";
      for (let i = 0; i < hiddenEls.length; i++) {
        hiddenEls[i].style.display = "none";
      }
    }

    // animação de entrada
    adminTela.classList.remove("fade-outX");
    adminTela.classList.add("fade-inX");

    // limpa a classe depois da animação
    setTimeout(() => {
      adminTela.classList.remove("fade-inX");
    }, 400);
  }, 400);
}

async function salvarBairro() {
  const nome = document.getElementById("bairro-nome").value;
  const lat = parseFloat(document.getElementById("bairro-lat").value);
  const lon = parseFloat(document.getElementById("bairro-lon").value);

  if (!nome || isNaN(lat) || isNaN(lon)) {
    alert("Preencha todos os campos!");
  }

  const res = await fetch("http://localhost:8080/auth/bairrosAdd", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, latitude: lat, longitude: lon }),
  });

  if (res.ok) {
    showAlert("Bairro adicionado!", "success", 3000);
    // Opcional: adicionar marker no mapa
    L.marker([lat, lon]).addTo(map).bindPopup(nome);
  } else if (res.status == 409) {
    showAlert("Bairro ja cadastrado", "error", 3000);
  } else {
    showAlert("Erro ao salvar bairro", "error", 3000);
  }
}

function initMap() {
  if (map) {
    map.remove();
  }

  map = L.map("map", {
    minZoom: 14.5,
    maxZoom: 18,
  }).setView([0, 0], 13);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);

  fetch("http://localhost:8080/auth/bairros")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((bairro) => {
        // Cria um ícone HTML com o nome do bairro
        console.log(bairro);
        const nomeIcon = L.divIcon({
          className: "nome-bairro", // classe CSS (para estilizar)
          html: `<button id="bairrosNome" onclick='hudAvaliar(${JSON.stringify(
            bairro
          )})'>${bairro.nome}</button>`,
          iconSize: [100, 20], // tamanho do “bloco” de texto
          iconAnchor: [50, 10], // centraliza o nome na coordenada
        });

        // Adiciona o nome ao mapa como marcador textual
        L.marker([bairro.latitude, bairro.longitude], { icon: nomeIcon }).addTo(
          map
        );
      });
    });

  map.locate({ setView: true });

  map.on("locationfound", function (e) {
    L.marker(e.latlng)
      .addTo(map)
      .bindPopup(`<b style = "color: #629ac7">Você está aqui!</b>`)
      .openPopup();
  });

  map.on("locationerror", function () {
    alert("Não foi possível acessar sua localização.");
  });
}

setTimeout(() => {
  initMap();
}, 500);
var map;

function hudAvaliar(bairro) {
  const hudMinimizado = document.getElementById("hudMinimizado");

  hudMinimizado.style.display = "flex";

  setTimeout(() => {
    hudMinimizado.classList.add("fade-inY");
  }, 50);

  setTimeout(() => {
    hudMinimizado.classList.remove("fade-inX");
  }, 600);

  // ... (restante do código: listener de fechar e atualização do título) ...

  document
    .getElementsByClassName("fechar")[0]
    .addEventListener("click", function () {
      hudMinimizado.classList.remove("fade-inY");

      setTimeout(() => {
        hudMinimizado.style.display = "none";
      }, 400);
    });
  document.getElementsByClassName("titulo_local")[0].innerHTML = bairro.nome;
}
initMap();
