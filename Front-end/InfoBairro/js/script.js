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

  const res = await fetch("http://localhost:8080/auth/bairros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, latitude: lat, longitude: lon }),
  });

  if (res.ok) {
    showAlert("Bairro adicionado!", "success", 3000);
    // Opcional: adicionar marker no mapa
    L.marker([lat, lon]).addTo(map).bindPopup(nome);
  } else {
    showAlert("Erro ao salvar bairro", "error", 3000);
  }
}
function loginWithGoogle() {
  const largura = 500;
  const altura = 600;
  const left = screen.width / 2 - largura / 2;
  const top = screen.height / 2 - altura / 2;

  const oauthUrl = "http://localhost:8080/oauth2/authorization/google";
  // essa é a URL que inicia o fluxo OAuth2 no seu backend

  const janela = window.open(
    oauthUrl,
    "Login com Google",
    `width=${largura},height=${altura},top=${top},left=${left}`
  );

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

window.onload = init;

async function carregarUsuario() {
  const res = await fetch("http://localhost:8080/auth/user", {
    credentials: "include",
  });
  const data = await res.json();

  const div = document.getElementById("container");
  div.innerHTML = "";

  if (!data.rua || !data.cep || !data.bairro) {
    document.getElementsByClassName("login")[0].style.display = "none";
    showAlert("Complete seu cadastro", "info", 3000);
    div.innerHTML = `
      <form id="complemento">
      <h2 class="BemVindo">Complete seu cadastro</h2>
      <div id="complementoCell">
      <br>
      <label for="cep">Insira o seu CEP:</label><br>
      <input type="text" id="cep" maxlength="9" placeholder="00000-000" required>
      <br>
      <label for="bairro">Insira o seu bairro:</label><br>
      <input type="text" id="bairro" placeholder="Insira aqui o seu bairro" required>
      <br>
      <label for="rua">Insira a sua rua:</label><br>
      <input type="text" id="rua" name="street-address" placeholder="Insira aqui a sua rua" autocomplete="street-address" required>
      <br>
      </div>
      <br>
      <table>
    <tr>
    <td>
    <label for="cep">Insira o seu CEP:</label><br>
      <input type="text" id="cep" maxlength="9" placeholder="00000-000" required>
    </td>
    <td>
    <label for="bairro">Insira o seu bairro:</label><br>
    <input type="text" id="bairro" placeholder="Insira aqui o seu bairro" required>
    </td>
    </tr>
    <tr>
    <td colspan="2">
    <label for="rua">Insira a sua rua:</label><br>
    <input type="text" id="rua" name="street-address" placeholder="Insira aqui a sua rua" autocomplete="street-address" required>
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

      await fetch("http://localhost:8080/auth/user/complemento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rua, cep, bairro }),
      });

      carregarUsuario(); // recarrega dados
    };
  } else {
    // já está completo
    trocarConteudo(`
      <div id="map"></div>
      <div id="admin-card" class="admin-card hidden">
  <div id="card-header">Adicionar Bairro</div>
  <div id="card-body" class="hidden">
  <form onsubmit="salvarBairro()">
    <label>Nome:</label>
    <input id="bairro-nome" type="text" />
    <label>Latitude:</label>
    <input id="bairro-lat" type="number" step="any" />
    <label>Longitude:</label>
    <input id="bairro-lon" type="number" step="any" />
    <input type="submit">Salvar</input>
    </form>
  </div>
</div>
`);
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
        L.marker([bairro.latitude, bairro.longitude])
          .addTo(map)
          .bindPopup(bairro.nome);
      });
    });

  map.locate({ setView: true });

  map.on("locationfound", function (e) {
    L.marker(e.latlng).addTo(map).bindPopup("Você está aqui!").openPopup();
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
    if (novoHTML == `<div id="map"></div>`) {
      initMap();
    }
  }, 400);
}
async function cadastrar() {
  const nome = document.getElementById("nomeC").value;
  const email = document.getElementById("emailC").value;
  const senha = document.getElementById("senhaC").value;
  const confirmasenha = document.getElementById("senhaR").value;
  const cep = document.getElementById("cepC").value;
  const bairro = document.getElementById("bairroC").value;
  const rua = document.getElementById("ruaC").value;

  if (senha !== confirmasenha) {
    showAlert("As senhas devem ser iguais", "error", 3000);
    return;
  }

  const res = await fetch("http://localhost:8080/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ nome, email, senha, cep, bairro, rua }),
  });

  if (res.ok) {
    showAlert("Cadastro realizado com sucesso", "success", 3000);
    loginTela(); // vai para tela de login
  } else {
    const msg = await res.text();
    showAlert(msg, "error", 3000);
  }
}
async function login() {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const res = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, senha }),
    });

    if (res.ok) {
      showAlert("Login bem-sucedido!", "success");
      const data = await res.json();
      console.log(data);
      window.location.href = "index.html";
    } else {
      // customiza mensagem de acordo com o status
      switch (res.status) {
        case 400:
          showAlert("Requisição inválida!", "error");
          break;
        case 401:
          showAlert("Email ou senha incorretos!", "error");
          break;
        case 404:
          showAlert("Usuário não encontrado!", "error");
          break;
        case 500:
          showAlert("Erro no servidor, tente mais tarde.", "error");
          break;
        default:
          showAlert(`Erro ${res.status}: ${res.statusText}`, "error");
      }
    }
  } catch (err) {
    showAlert("Não foi possível conectar ao servidor.", "error", 3000);
    console.error(err);
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
    <form class="Flogin" method="post" onsubmit="return validarCadastro()">

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
    <br>
    <label for="cepC">Insira o seu CEP:</label> <br>
    <input type="number" id="cepC" placeholder="00000-000" maxlength="9" required>
    <br>
    <br>
    <label for="bairroC">Insira o seu bairro:</label> <br>
    <input type="text" id="bairroC" placeholder="Insira aqui o seu bairro" required>
    <br>
    <br>
    <label for="ruaC">Insira a sua rua:</label> <br>
    <input type="text" id="ruaC" name="street-address" placeholder="Insira aqui a sua rua" placeholder="Insira aqui a sua rua" required>
    <br>
    </div>


    <table>
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
      <input type="text" id="cepCT" maxlength="9" placeholder="00000-000" required>
    </td>
    <td>
    <label for="bairroCT">Insira o seu bairro:</label><br>
    <input type="text" id="bairroCT" placeholder="Insira aqui o seu bairro" required>
    </td>
    </tr>
    <tr>
    <td colspan="2">
    <label for="ruaCT">Insira a sua rua:</label><br>
    <input type="text" id="ruaCT" name="street-address" placeholder="Insira aqui a sua rua" autocomplete="street-address" required>
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

    
    
    <br>
    <div = id="botaoS">
    <input type="submit" value="Cadastrar">
    <button id="loginGoogle" onclick="loginWithGoogle()"><img src="./img/google.png" alt="Google" width="30px" height="30px">Cadastrar com Google</button>
    </div>
    </form>
    
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
    <form class="Flogin" method="post" onsubmit="login()">
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
<input type="submit" value="Entrar">

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
var map;
initMap();
