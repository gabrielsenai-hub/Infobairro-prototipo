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

function validarForca(senhaInput) {
  const senha = senhaInput.value;
  var barraGrab;
  var textoGrab;
  if (window.innerWidth <= 730) {
    barraGrab = document.getElementById("forcaBarraCell");
    textoGrab = document.getElementById("forcaTextoCell");
  } else {
    barraGrab = document.getElementById("forcaBarraDKT");
    textoGrab = document.getElementById("forcaTextoDKT");
  }
  const barra = barraGrab;
  const texto = textoGrab;

  const maxLength = 128;

  if (senha.length == maxLength) {
    barra.style.width = "100%";
    barra.style.background = "orange";
    texto.innerText = `Senha muito longa! Máximo permitido: ${maxLength} caracteres.`;
    return;
  }

  let pontos = 0;
  let motivos = [];

  if (senha.length >= 8) {
    pontos++;
  } else {
    motivos.push("menos de 8 caracteres");
  }

  if (/[A-Z]/.test(senha)) {
    pontos++;
  } else {
    motivos.push("sem letra maiúscula");
  }

  if (/[a-z]/.test(senha)) {
    pontos++;
  } else {
    motivos.push("sem letra minúscula");
  }

  if (/[0-9]/.test(senha)) {
    pontos++;
  } else {
    motivos.push("sem número");
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
    pontos++;
  } else {
    motivos.push("sem caractere especial");
  }

  // Calcula largura proporcional (0% a 100%)
  const largura = (pontos / 5) * 100;
  barra.style.width = `${largura}%`;

  // Define cor gradualmente: vermelho → laranja → verde
  if (pontos <= 1) {
    barra.style.background = "red";
  } else if (pontos <= 3) {
    barra.style.background = "orange";
  } else {
    barra.style.background = "green";
  }

  // Mensagem detalhada
  if (pontos <= 1) {
    texto.innerText = `Senha fraca: ${motivos.join(", ")}`;
  } else if (pontos <= 3) {
    texto.innerText = `Senha média: ${motivos.join(", ")}`;
  } else {
    texto.innerText = `Senha forte: ${motivos.join(", ")}`;
  }
  if (senha.length == 0) {
    texto.innerText = "";
  }
}
function validarSenha(senha, confirmasenha) {
  // Escolhe o elemento correto com base na largura da tela
  const resultId = window.innerWidth <= 730 ? "validarCell" : "validarDKT";
  const result = document.getElementById(resultId);

  result.style.fontSize = "15px";

  if (!senha || !confirmasenha) {
    result.style.color = "gray";
    result.innerText = "Nada a comparar.";
    return;
  }

  if (senha === confirmasenha) {
    result.style.color = "green";
    result.innerText = "As senhas conferem.";
  } else {
    result.style.color = "red";
    result.innerText = "As senhas não conferem.";
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

async function cadastrar() {
  const nome = "";
  const email = "";
  const senha = "";
  const cep = "";
  const bairro = "";
  const rua = "";
  const dataNascimento = "";

  window.innerWidth <= 730
    ? ((nome = document.getElementById("nomeC").value),
      (email = document.getElementById("emailC").value),
      (senha = document.getElementById("senhaC").value),
      (confirmasenha = document.getElementById("senhaR").value),
      (cep = document.getElementById("cepC").value),
      (bairro = document.getElementById("bairroC").value),
      (rua = document.getElementById("ruaC").value),
      (cidade = document.getElementById("cidadeC").value),
      (dataNascimento = document.getElementById("dataNascimentoC").value))
    : ((nome = document.getElementById("nomeCT").value),
      (email = document.getElementById("emailCT").value),
      (senha = document.getElementById("senhaCT").value),
      (confirmasenha = document.getElementById("senhaRT").value),
      (cep = document.getElementById("cepCT").value),
      (bairro = document.getElementById("bairroCT").value),
      (rua = document.getElementById("ruaCT").value),
      (cidade = document.getElementById("cidadeCT").value),
      (dataNascimento = document.getElementById("dataNascimentoCT").value));
  
  if (senha != confirmasenha) {
    showAlert("As senhas devem ser iguais", "error", 3000);
  }

  const res = await fetch("http://localhost:8080/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      nome,
      email,
      senha,
      cep,
      bairro,
      rua,
      cidade,
      dataNascimento,
    }),
  });
  console.log(res);
  if (res.ok) {
    for (let i = 0; i < document.getElementsByClassName("acesso").length; i++) {
      document.getElementsByClassName("acesso")[i].style.display = "none";
    }
    showAlert("Cadastro realizado com sucesso", "success", 3000);
    loginTela(); // vai para tela de login
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
  } else {
    const msg = await res.text();
    showAlert(msg, "error", 3000);
  }
}

// função login genérica — funciona pra qualquer form com inputs name="..." dentro de #Flogin
async function login() {
  const form = document.getElementsByClassName("Flogin")[0];
  if (!form) return console.error("Form não encontrado: .Flogin");

  // previne envios múltiplos
  if (form.dataset.sending === "true") return;
  form.dataset.sending = "true";

  const submitBtn = form.querySelector('[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    // pega valores diretamente (sem FormData)
    const emailInput = form.querySelector('input[id="email"]');
    const senhaInput = form.querySelector('input[id="senha"]');

    const email = emailInput ? emailInput.value.trim() : "";
    const senha = senhaInput ? senhaInput.value : "";

    // validação mínima
    if (!email || !senha) {
      showAlert("Preencha email e senha", "info", 2000);
      return;
    }

    const payload = { email, senha };

    const res = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // tenta extrair mensagem JSON, se não der pega texto bruto
      let errMsg = `Erro ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson) {
          if (errJson.message) errMsg = errJson.message;
          else if (errJson.error) errMsg = errJson.error;
          else errMsg = JSON.stringify(errJson);
        }
      } catch (e) {
        const txt = await res.text();
        if (txt) errMsg = txt;
      }
      showAlert(errMsg, "error", 3000);
      console.error("login failed", res.status, res.statusText);
      return;
    }

    const data = await res.json(); // dados do servidor
    showAlert("Login realizado!", "success", 1500);
    for (let i = 0; i < document.getElementsByClassName("acesso").length; i++) {
      document.getElementsByClassName("acesso")[i].style.display = "none";
    }

    // atualiza a UI / puxa dados do usuário
    if (typeof carregarUsuario === "function") {
      carregarUsuario();
    } else {
      window.location.reload();
    }
  } catch (err) {
    console.error("Erro na requisição de login:", err);
    showAlert("Erro ao conectar com o servidor. Veja console.", "error", 3000);
  } finally {
    form.dataset.sending = "false";
    if (submitBtn) submitBtn.disabled = false;
  }
}

function cadastrarTela() {
  document.getElementById("cadastrar").style.display = "none";
  document.getElementById("entrar").style.display = "block";
  document.getElementById("voltar").style.display = "block";

  trocarConteudo(`
  <div class="ICadastro">
  <div id="carrossel2">
    <div class="conteudo">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    <img src="./img/Casa2.png">
    </div>
    </div>
    <div class="telaL">
    <h3 class="BemVindo">Bem-vindo!</h3>
    <form class="FCadastro">

  <div id="CadCell">
    <br>
    <label for="nomeC">Nome:</label> <br>
    <input type="text" id="nomeC" placeholder="Insira aqui o seu nome" required>
    <br>
    <br>
    <label for="emailC">Email:</label> <br>
    <input type="email" id="emailC" placeholder="Insira aqui o seu email" required>
    <br>
    <br>
    <label for="cepC">Insira o seu CEP:</label> <br>
    <input name="cep" type="number" id="cepC" placeholder="00000-000" maxlength="8" oninput="buscaCep(this)"  required>
    <br>
    <br>
    <label for="bairroC">Insira o seu bairro:</label> <br>
    <input name="bairro" type="text" id="bairroC" placeholder="Insira aqui o seu bairro" required>
    <br>
    <br>
    <label for="ruaC">Insira a sua rua:</label> <br>
    <input name="rua" type="text" id="ruaC" placeholder="Insira aqui a sua rua" placeholder="Insira aqui a sua rua" required>
    <br>
    <br>
    <label for="cidadeC">Insira a sua cidade:</label> <br>
    <input name="cidade" type="text" id="cidadeC" placeholder="Insira aqui a sua cidade" required>
    <br>
    <br>
    <label for="dataNascimentoC">Data de Nascimento:</label><br>
    <input type="date" id="dataNascimentoC" required>
    <br>
    <br>
      <label for="senhaC">Defina uma senha:</label> <br>
    <input type="password" id="senhaC" oninput="validarForca(this)" placeholder="Insira aqui a senha" required>
    <br>
    <div id="forca-container">
    <div class="forca-barra" id="forcaBarraCell"></div>
    </div>
    <p class="forca-texto" id="forcaTextoCell"></p>
    <br>
    <br>
    <label for="senhaR">Repita a Senha:</label> <br>
    <input type="password" oninput="validarSenha(document.getElementById('senhaC').value, this.value)" id="senhaR" placeholder="Insira aqui a senha" required>
    <br>
    <p id="validarCell"></p>
    
    <br>
    
    <div = class="botaoS">
    <input type="submit" value="Cadastrar" onclick="cadastrar()">
    <button id="loginGoogle" onclick="loginWithGoogle()"><img src="./img/google.png" alt="Google" width="30px" height="30px">Cadastrar com Google</button>
    </div>
    </div>
    </form>
    <form class="FCadastro">
    <table id="CadDKT">
    <tr>
    <td>
    <label for="nomeCT">Nome:</label><br>
    <input type="text" id="nomeCT" placeholder="Insira aqui o seu nome" required>
    </td>
    <td>
    <label for="emailCT">Email:</label><br>
    <input type="email" id="emailCT" placeholder="Insira aqui o seu email" required>
    </td>
    </tr>
    <tr>
    <td>
    <label for="cepCT">Insira o seu CEP:</label><br>
      <input name="cep" type="number" id="cepCT" maxlength="8" placeholder="00000000 (sem hifen)" oninput="buscaCep(this)"required>
    </td>
    <td>
    <label for="bairroCT">Insira o seu bairro:</label><br>
    <input name="bairro" type="text" id="bairroCT" placeholder="Insira aqui o seu bairro" required>
    </td>
    </tr>
    <tr>
    <td>
    <label for="ruaCT">Insira a sua rua:</label><br>
    <input name="rua" type="text" id="ruaCT" placeholder="Insira aqui a sua rua" name="ruaCT" autocomplete="street-address" required>
    </td>
    <td>
    <label for="cidadeCT">Insira a sua cidade:</label><br>
    <input name="cidade" type="text" id="cidadeCT" placeholder="Insira aqui a sua cidade" required>
    </td>
    </tr>
    <tr>
    <td>
    <label for="dataNascimentoCT">Data de Nascimento:</label><br>
    <input type="date" id="dataNascimentoCT" required min="1920-01-01" max="2022-01-01">
    </td>
    </tr>
        <tr>
    <td>
    <label for="senhaCT">Defina uma senha:</label><br>
    <input type="password" id="senhaCT" maxlength="128" inlength="8" oninput="validarForca(this); validarSenha(document.getElementById('senhaCT').value, document.getElementById('senhaRT').value)" placeholder="Insira aqui a senha" maxlength="128" required>
    <br>
    </td>
        <td>
    <label for="senhaRT">Repita a Senha:</label><br>
    <input type="password" id="senhaRT" oninput="validarSenha(document.getElementById('senhaCT').value, this.value)" placeholder="Insira aqui a senha" required>
    </td>

    <tr>
    <td class="forca">
    <div id="forca-container">
    <div class="forca-barra" id="forcaBarraDKT"></div>
    </div>
    <p class="forca-texto" id="forcaTextoDKT"></p>
    </td>
    <td id="validacaoP">
    <p id="validarDKT"></p>
    </td>
    </tr>
    
    </tr>

    </table>
    <div = class="botaoS">
    <input type="submit" value="Cadastrar" onclick="cadastrar()">
    <button id="loginGoogle" onclick="loginWithGoogle()"><img src="./img/google.png" alt="Google" width="30px" height="30px">Cadastrar com Google</button>
    </div>
    
    </form>
    
    
    <br>
    
    </div>    
    
    </div>    
    `);
}
function loginTela() {
  document.getElementById("entrar").style.display = "none";
  document.getElementById("cadastrar").style.display = "block";
  document.getElementById("voltar").style.display = "block";

  trocarConteudo(`

    <div class="Ilogin">
        <div class="carrossel1">
        <div class="conteudo">
        <img src="./img/Casa1.png">
        <img src="./img/Casa1.png">
        <img src="./img/Casa1.png">
        <img src="./img/Casa1.png">
        <img src="./img/Casa1.png">
        <img src="./img/Casa1.png">
        <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    
    </div>
    </div>
    
    <div class="telaL">
    <h3 class="BemVindo" style="font-size: 30px;">Bem-vindo</h3>
    <form class="Flogin">
<table>
<tr>
<tr>
<br>
<label for="email">Email:</label>
<input type="email" id="email" placeholder="Insira aqui o seu email" required>
</tr>
<tr>
<br>
<label for="senha">Senha:</label>
<input type="password" id="senha" placeholder="Insira aqui a sua senha" required>
</tr>
<tr>
<br>
<input type="submit" value="Entrar" onclick="login()">

</tr>
</tr>
</table>

</form>
<button id="loginGoogle" onclick="loginWithGoogle()"><img src="./img/google.png" alt="Google" width="30px" height="30px">Entrar com Google</button>
</div>            
<div class="carrossel1" id="carrossel1-1">
<div class="conteudo">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
<img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    <img src="./img/Casa1.png">
    </div>
    </div>
    

    `);
}

function voltarInicio() {
  document.getElementById("entrar").style.display = "block";
  document.getElementById("cadastrar").style.display = "block";
  document.getElementById("voltar").style.display = "none";

  trocarConteudo(`<div id="map"></div>`);
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

function buscaCep(cepC) {
  var form = "";
  if(window.innerWidth <= 730) {
    
    form = document.getElementById("CadCell");
  }
  else {
    form = document.getElementById("CadDKT");
  }

  if (!form) {
  alert("Formulário #FCadastro não encontrado!");
}

  const cep = cepC.value.replace(/\D/g, ""); // só números
  if (cep.length === 8) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.erro) {
          const mapCampos = {
            rua: "logradouro",
            bairro: "bairro",
            cidade: "localidade",
          };

          Object.keys(mapCampos).forEach((campoForm) => {
            const input = form.querySelector(`input[name="${campoForm}"]`);
            if (input) {
              input.value = data[mapCampos[campoForm]] || "";
              console.warn(`Campo "${data[mapCampos[campoForm]]}" substituido com sucesso.`);
            } else {
            }
          });
        } else {
          console.warn(`CEP não encontrado: ${cep}`);
        }
      })
      .catch((err) => console.warn("Erro ao buscar CEP:", err));
  }
}
function buscaCepComplemento(cepC) {
  var form = "";
  if(window.innerWidth <= 730) {
    
    form = document.getElementById("complementoCell");
  }
  else {
    form = document.getElementById("complementoDKT");
  }

  if (!form) {
  alert("Formulário #FCadastro não encontrado!");
}

  const cep = cepC.value.replace(/\D/g, ""); // só números
  if (cep.length === 8) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.erro) {
          const mapCampos = {
            rua: "logradouro",
            bairro: "bairro",
            cidade: "localidade",
          };

          Object.keys(mapCampos).forEach((campoForm) => {
            const input = form.querySelector(`input[name="${campoForm}"]`);
            if (input) {
              input.value = data[mapCampos[campoForm]] || "";
              console.warn(`Campo "${data[mapCampos[campoForm]]}" substituido com sucesso.`);
            } else {
            }
          });
        } else {
          console.warn(`CEP não encontrado: ${cep}`);
        }
      })
      .catch((err) => console.warn("Erro ao buscar CEP:", err));
  }
}

var map;
initMap();
