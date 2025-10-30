function loginWithGoogle() {
  const oauthUrl = "http://localhost:8080/oauth2/authorization/google";
  // essa é a URL que inicia o fluxo OAuth2 no seu backend

  const janela = window.open.apply(oauthUrl, "Login com Google");

  // opcional: monitorar se a janela foi fechada
  const timer = setInterval(() => {
    if (janela.closed) {
      clearInterval(timer);
      console.log("Janela fechada, pode checar se o login foi concluído");
    }
  }, 500);
}

async function init() {
  try {
    await carregarUsuario();
  } catch (err) {
    console.error("Erro ao carregar usuário:", err);
    showAlert("Erro ao carregar usuário", "error", 3000);
  }
}

async function carregarUsuario() {
  try {
    const res = await fetch("http://localhost:8080/auth/user", {
      // NÃO use no-cors
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error("Resposta do servidor:", res.status, res.statusText);
      showAlert("Erro no servidor: " + res.status, "error", 3000);
      return;
    }

    const data = await res.json();

    const div = document.getElementById("container");
    div.innerHTML = "";

    if (data.admin == true)
      document.getElementById("admin").style.display = "block";

    if (
      !data.rua ||
      !data.cep ||
      !data.bairro ||
      !data.dataNascimento ||
      !data.cidade
    ) {
      document.getElementsByClassName("login")[0].style.display = "none";
      showAlert("Complete seu cadastro", "info", 3000);
      div.innerHTML = `
      <form id="complemento" style="
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      box-shadow: 0px 0px 10px rgba(121, 120, 120, 0.808);
      border-radius: 10px;
      padding: 15px;">
      <h2 class="BemVindo">Complete seu cadastro</h2>
      <div id="complementoCell">
      <br>
      <label for="cep">Insira o seu CEP:</label><br>
      <input name="cep" type="number" id="cep" maxlength="8" placeholder="00000000" oninput="buscaCepComplemento(this)" required>
      <br>
      <label for="bairro">Insira o seu bairro:</label><br>
      <input name="bairro" type="text" id="bairro" placeholder="Insira aqui o seu bairro" required>
      <br>
      <label for="rua">Insira a sua rua:</label><br>
      <input name="rua" type="text" id="rua" placeholder="Insira aqui a sua rua" autocomplete="street-address" required>
      <br>
      <label for="cidade">Insira a sua cidade:</label><br>
      <input name="cidade" type="text" id="cidade" placeholder="Insira aqui a sua cidade" required>
      <br>
      <label for="nascimento">Insira a sua data de nascimento:</label><br>
      <input type="date" id="nascimento" required>
      <br>
      
      </div>
      <br>
      <table id="complementoDKT">
      <tr>
      <td>
    <label for="cep">Insira o seu CEP:</label><br>
    <input name="cep" type="number" id="cep" maxlength="8" placeholder="00000000 (sem hifen)" oninput="buscarCep(this)" required>
    </td>
    <td>
    <label for="bairro">Insira o seu bairro:</label><br>
    <input name="bairro" type="text" id="bairro" placeholder="Insira aqui o seu bairro" required>
    </td>
    </tr>
    <tr>
    <td>
    <label for="rua">Insira a sua rua:</label><br>
    <input name="rua" type="text" id="rua" placeholder="Insira aqui a sua rua" autocomplete="street-address" required>
    </td>
    <td>
    <label for="cidade">Insira a sua cidade:</label><br>
    <input name="cidade" type="text" id="cidade" placeholder="Insira aqui a sua cidade" required>
    </td>
    <td>
    <label for="nascimento">Insira a sua data de nascimento:</label><br>
    <input type="date" id="nascimento" required>
    </td>
    </tr>
    </table>
    <input type="submit" id="salvar" value="Finalizar">
      </form>
      `;
      document.getElementById("salvar").onclick = async () => {
        const rua = document.getElementById("rua").value;
        const cep = document.getElementById("cep").value;
        const bairro = document.getElementById("bairro").value;
        const cidade = document.getElementById("cidade").value;
        const dataNascimento = document.getElementById("nascimento").value;

        await fetch("http://localhost:8080/auth/user/complemento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ rua, cep, bairro, cidade, dataNascimento }),
        });

        carregarUsuario(); // recarrega dados
      };
    } else {
      // já está completo
      trocarConteudo(`
      <div id="map"></div>
      <div id="admin">
     <div class="adminCardOpt" onclick="adminCard()"><img src="./img/botaoLateral.png" style="width: 24px;"></div>
      <div id="admin-card" class="admin-card hidden">
      <div id="card-header"> <img src="./img/botaoLateralAdc.png" style="width: 20px; cursor: pointer;" onclick="adminCard()"> Adicionar Bairro</div>
      <div id="card-body" class="hidden">
        <form onsubmit="salvarBairro()">
          <table class="adcBairro" id="formAdcBairro">
            <tr>
              <td>
                <label>Nome:</label>
              </td>
              <td>
                <input id="bairro-nome" type="text" />
              </td>
            </tr>

            <tr >
              <td>
                <label for="bairro-lat">Latitude:</label>
              </td>
              <td>
                <input id="bairro-lat" type="number" step="any" />
              </td>
            </tr>
            <tr">
              <td>

                <label for="bairro-lon">Longitude:</label>
              </td>
              <td>

                <input id="bairro-lon" type="number" step="any" />
              </td>
            </tr>
          </table>
          <input type="submit" value="Salvar" />
        </form>
      </div>
      </div>
    </div>
`);
    }
  } catch (err) {
    console.error("Erro ao conectar:", err);
    showAlert(
      "Não foi possível conectar ao servidor. Veja console.",
      "error",
      3000
    );
  }
}

setTimeout(() => {
  initMap();
}, 500);
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
        console.log(bairro);
        L.marker([bairro.latitude, bairro.longitude])
          .addTo(map)
          .bindPopup(bairro.nome);
      });
    });

  map.locate({ setView: true });

  map.on("locationfound", function (e) {
    L.marker(e.latlng)
      .addTo(map)
      .bindPopup(`${e.latlng.lat}, ${e.latlng.lng}`)
      .openPopup();
  });

  map.on("locationerror", function () {
    alert("Não foi possível acessar sua localização.");
  });
}
function trocarConteudo(novoHTML) {
  const container = document.getElementById("container");
  // adiciona a animação de saída
  container.classList.add("fade-out");

  // espera a transição terminar
  setTimeout(() => {
    container.innerHTML = novoHTML; // troca conteúdo
    container.classList.remove("fade-out");
    container.classList.add("fade-in");

    // remove a classe depois que a animação rodar
    setTimeout(() => {
      container.classList.remove("fade-in");
    }, 400);
    if (novoHTML.includes(`<div id="map"></div>`)) {
      initMap();
    }
  }, 400);
}

function showAlert(message, type, duration) {
  const alertBox = document.getElementById("customAlert");
  const alertMessage = document.getElementById("alertMessage");

  alertMessage.innerText = message;

  // muda a cor dependendo do tipo
  if (type === "success") {
    alertBox.style.backgroundColor = "#4CAF50"; // verde
  } else if (type === "info") {
    alertBox.style.backgroundColor = "#2196F3"; // azul
  } else {
    alertBox.style.backgroundColor = "#ff4d4f"; // vermelho
  }

  alertBox.classList.add("show");

  // esconde depois de 'duration' ms
  setTimeout(() => {
    alertBox.classList.remove("show");
  }, duration);
}

var map;
initMap();
