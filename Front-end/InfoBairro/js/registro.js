const erro = localStorage.getItem("Erro")
const spam1 = localStorage.getItem("Spam1")
const spam2 = localStorage.getItem("Spam2")

console.log(`${erro}\n\n${spam1}\n\n${spam2}`)

async function cadastrar(event) {
  // Se chamado por onsubmit de um form, previne o reload
  if (event && event.preventDefault) event.preventDefault();

  // declarar com let para poder reatribuir
  let nome = "";
  let email = "";
  let senha = "";
  let confirmasenha = "";
  let cep = "";
  let bairro = "";
  let rua = "";
  let cidade = "";
  let dataNascimento = "";

  // usar if/else fica mais legível
  if (window.innerWidth <= 730) {
    nome = document.getElementById("nomeC")?.value.trim() ?? "";
    email = document.getElementById("emailC")?.value.trim() ?? "";
    senha = document.getElementById("senhaC")?.value ?? "";
    confirmasenha = document.getElementById("senhaR")?.value ?? "";
    cep = document.getElementById("cepC")?.value.trim() ?? "";
    bairro = document.getElementById("bairroC")?.value.trim() ?? "";
    rua = document.getElementById("ruaC")?.value.trim() ?? "";
    cidade = document.getElementById("cidadeC")?.value.trim() ?? "";
    dataNascimento = document.getElementById("dataNascimentoC")?.value ?? "";
  } else {
    nome = document.getElementById("nomeCT")?.value.trim() ?? "";
    email = document.getElementById("emailCT")?.value.trim() ?? "";
    senha = document.getElementById("senhaCT")?.value ?? "";
    confirmasenha = document.getElementById("senhaRT")?.value ?? "";
    cep = document.getElementById("cepCT")?.value.trim() ?? "";
    bairro = document.getElementById("bairroCT")?.value.trim() ?? "";
    rua = document.getElementById("ruaCT")?.value.trim() ?? "";
    cidade = document.getElementById("cidadeCT")?.value.trim() ?? "";
    dataNascimento = document.getElementById("dataNascimentoCT")?.value ?? "";
  }

  // validação de senha: interrompe se não bate
  if (senha !== confirmasenha) {
    showAlert("As senhas devem ser iguais", "error", 3000);
    return;
  }

  // montar payload
  const payload = { nome, email, senha, cep, bairro, rua, cidade, dataNascimento };

  try {
    const res = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    // consumir o corpo uma vez e armazenar de forma segura (texto/obj JSON)
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }

    // Exemplo de armazenamento: salvar status + body (string)
    localStorage.setItem("Spam2", JSON.stringify({ status: res.status, body }));

    if (res.ok) {
      // esconder elementos .acesso
      const acessos = document.getElementsByClassName("acesso");
      for (let i = 0; i < acessos.length; i++) {
        acessos[i].style.display = "none";
      }
      showAlert("Cadastro realizado com sucesso", "success", 3000);

      // Opcional: armazenar resposta útil (token, user id). NÃO armazene senha.
      localStorage.setItem("Spam1", JSON.stringify(body));

      // atualizar UI
      loginTela();
      trocarConteudo(`... seu template ...`);
    } else {
      // se o servidor retornou erro, mostrar mensagem
      const mensagem = (body && body.message) ? body.message : String(body);
      showAlert(mensagem, "error", 3000);
      localStorage.setItem("Erro", mensagem);
    }
  } catch (err) {
    // catch para falhas de rede
    console.error("Erro no fetch:", err);
    showAlert("Erro de rede: " + err.message, "error", 3000);
  }
}

async function login() {
  const form = document.getElementsByClassName("FormLogin")[0];
  if (!form) return console.error("Form não encontrado: .FormLogin");

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
  
    </div>
    </div>
    <div class="telaL">
    <h3 class="BemVindo">Bem-vindo!</h3>
    <form class="FCadastro" onsubmit="cadastrar(event)">

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


    
    <form class="FCadastro" onsubmit="cadastrar(event)">
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
    <button type="submit">Cadastrar</button>
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
          <div class="repeticaoCasa1" onload="carrosselLogin()">    
    </div>
    </div>
    
    <div class="telaL">
    <h3 class="BemVindo" style="font-size: 30px;">Bem-vindo</h3>
    <form class="FormLogin">
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
<div class="repeticaoCasa1" onload="carrosselLogin()></div>
    </div>
    

    `);

}

function carrosselLogin() {
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 30; i++) {

      var casa = document.createElement("img");
      casa.src = "../img/Casa1.png";
      document.getElementsByClassName("repeticaoCasa1")[j].appendChild(casa);

    }

  }
}
function voltarInicio() {
  document.getElementById("entrar").style.display = "block";
  document.getElementById("cadastrar").style.display = "block";
  document.getElementById("voltar").style.display = "none";

  trocarConteudo(`<div id="map"></div>`);
}