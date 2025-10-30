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
