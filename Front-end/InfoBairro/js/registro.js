const erro = localStorage.getItem("Erro");
const spam1 = localStorage.getItem("Spam1");
const spam2 = localStorage.getItem("Spam2");
const user = JSON.parse(localStorage.getItem("User"));
console.log(`${erro}\n\n${spam1}\n\n${spam2}`);

async function cadastrar(event) {
  if (event) event.preventDefault();

  const mobile = window.innerWidth <= 730;

  const nome =
    document.getElementById(mobile ? "nomeC" : "nomeCT")?.value.trim() ?? "";
  const email =
    document.getElementById(mobile ? "emailC" : "emailCT")?.value.trim() ?? "";
  const senha =
    document.getElementById(mobile ? "senhaC" : "senhaCT")?.value ?? "";
  const confirmasenha =
    document.getElementById(mobile ? "senhaR" : "senhaRT")?.value ?? "";
  const cep =
    document.getElementById(mobile ? "cepC" : "cepCT")?.value.trim() ?? "";
  const bairro =
    document.getElementById(mobile ? "bairroC" : "bairroCT")?.value.trim() ??
    "";
  const rua =
    document.getElementById(mobile ? "ruaC" : "ruaCT")?.value.trim() ?? "";
  const cidade =
    document.getElementById(mobile ? "cidadeC" : "cidadeCT")?.value.trim() ??
    "";
  const data_nascimento =
    document.getElementById(mobile ? "dataNascimentoC" : "dataNascimentoCT")
      ?.value ?? "";

  if (senha !== confirmasenha) {
    showAlert("As senhas devem ser iguais", "error", 3000);
    return;
  }

  const payload = {
    nome,
    email,
    senha,
    cep,
    bairro,
    rua,
    cidade,
    data_nascimento,
  };

  try {
    const res = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // tenta ler JSON, se não conseguir usa texto
    const responseText = await res.text(); // ler uma vez só
    let responseBody;

    try {
      responseBody = JSON.parse(responseText); // tenta decodificar JSON
    } catch {
      responseBody = responseText; // se não for JSON, fica como texto
    }

    // sucesso!
    showAlert("Cadastro realizado com sucesso", "success", 1500);

    // Guarda usuário (opcional)
    localStorage.setItem("User", JSON.stringify(responseBody));

    // atualiza UI
    const acessos = document.getElementsByClassName("acesso");
    for (let item of acessos) item.style.display = "none";

    setTimeout(() => {
      // trocarConteudo(`
      //   <div id="map"></div>
      //   <div id="admin">
      //     <div class="adminCardOpt" onclick="adminCard()">
      //       <img src="./img/botaoLateral.png" style="width: 24px;">
      //     </div>
      //     <div id="admin-card" class="admin-card hidden">
      //       <div id="card-header">
      //         <img src="./img/botaoLateralAdc.png" style="width: 20px; cursor: pointer;" onclick="adminCard()">
      //         Adicionar Bairro
      //       </div>
      //       <div id="card-body" class="hidden">
      //         <form onsubmit="salvarBairro()">
      //           <table class="adcBairro" id="formAdcBairro">
      //             <tr>
      //               <td><label>Nome:</label></td>
      //               <td><input id="bairro-nome" type="text"></td>
      //             </tr>
      //             <tr>
      //               <td><label>Latitude:</label></td>
      //               <td><input id="bairro-lat" type="number" step="any"></td>
      //             </tr>
      //             <tr>
      //               <td><label>Longitude:</label></td>
      //               <td><input id="bairro-lon" type="number" step="any"></td>
      //             </tr>
      //           </table>
      //           <input type="submit" value="Salvar">
      //         </form>
      //       </div>
      //     </div>
      //   </div>
      // `);
      // document.querySelector("configpop").style.display = "block";
    window.location.reload();
    }, 2000);
  } catch (err) {
    console.error("Erro no fetch:", err);
    showAlert("Erro de rede: " + err.message, "error", 3000);
  }
}

// function loginWithGoogle() {
//   const oauthUrl = "http://localhost:8080/oauth2/authorization/google";
//   const acessos = document.getElementsByClassName("loginBtn")[0];

//   // Abre o fluxo OAuth2 em uma nova janela (popup)
//   window.open(oauthUrl);
//   acessos.style.display = "none";

// }
async function login() {
  const form = document.getElementsByClassName("FormLogin")[0];
  if (!form) return console.error("Form não encontrado: .FormLogin");

  // previne envios múltiplos
  if (form.dataset.sending === "true") return;
  form.dataset.sending = "true";

  const submitBtn = form.querySelector(
    '[type="submit"], button[type="button"], button[type="submit"]'
  );
  if (submitBtn) submitBtn.disabled = true;

  let status;
  try {
    const emailInput = form.querySelector("#email");
    const senhaInput = form.querySelector("#senha");

    const email = emailInput ? emailInput.value.trim() : "";
    const senha = senhaInput ? senhaInput.value : "";

    if (!email || !senha) {
      showAlert("Preencha email e senha", "info", 2000);
      return;
    }

    const payload = { email, senha };
    console.log("Payload:", JSON.stringify(payload));
    const res = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include", // só funciona se o servidor habilitar CORS + credentials
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMsg = `Erro ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson) {
          errMsg = errJson.message || errJson.error || JSON.stringify(errJson);
        }
      } catch (e) {
        const txt = await res.text();
        if (txt) errMsg = txt;
      }
      status = res.status;
      showAlert(errMsg, "error", 3000);
      console.log("login failed", res.status, res.statusText);
      return;
    }

    const user = await res.json(); // dados do servidor

    showAlert("Login realizado!", "success", 1500);
    document
      .querySelectorAll(".acesso")
      .forEach((el) => (el.style.display = "none"));

    // armazenar corretamente
    localStorage.setItem("User", JSON.stringify(user));

    // recarregar / redirecionar corretamente
    window.location.reload();
    // ou: window.location.href = "/"; // se quiser ir para outra página
  } catch (err) {
    console.error("Erro na requisição de login:", err);
    if (status == 401) showAlert("Senha incorreta!", "error", 3000);
    else showAlert("Erro ao conectar com o servidor.", "error", 3000);
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
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
        <img src="./img/Casa2.png"/>
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
    <input name="cep" type="number" id="cepC" placeholder="00000000(sem hífen)" maxlength="8" oninput="buscaCep(this)"  required>
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
    <input type="date" id="dataNascimentoC" required min="1920-01-01" max="2008-01-01">
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
    <input type="date" id="dataNascimentoCT" required min="1920-01-01" max="2008-01-01">
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
  // carrosselLogin(document.getElementsByClassName("repeticaoCasa1")[0]);
  // carrosselLogin(document.getElementsByClassName("repeticaoCasa1")[1]);
  document.getElementById("entrar").style.display = "none";
  document.getElementById("cadastrar").style.display = "block";
  document.getElementById("voltar").style.display = "block";

  trocarConteudo(`
    
    <div class="Ilogin">
    <div class="carrossel1">
          <div class="repeticaoCasa1"> 
          <img src="./img/casaRep.png"/> 
          <img src="./img/casaRep.png"/> 
          <img src="./img/casaRep.png"/> 
          <img src="./img/casaRep.png"/> 
          
    </div>
    </div>
    
    <div class="telaL">
    <h3 class="BemVindo" style="font-size: 30px;">Bem-vindo</h3>
<form class="FormLogin" id="loginForm">
  <label for="email">Email:</label>
  <input type="email" id="email" placeholder="Insira aqui o seu email" required>

  <label for="senha">Senha:</label>
  <input type="password" id="senha" placeholder="Insira aqui a sua senha" required>

  <!-- type="button" para não submeter automaticamente -->
  <button type="button" onclick="login()" class="submit">Entrar</button>
</form>

</div>            
<div class="carrossel1" id="carrossel1-1">
<div class="repeticaoCasa1">
          <img src="./img/casaRep.png"/> 
          <img src="./img/casaRep.png"/> 
          <img src="./img/casaRep.png"/> 
          <img src="./img/casaRep.png"/> 
</div>
    </div>
    

    `);
}

function carrosselLogin(elemento) {
  for (let i = 0; i < 30; i++) {
    const img = document.createElement("img"); // cria o elemento
    img.src = `./img/Casa1.jpg`; // define o caminho da imagem
    elemento.appendChild(img); // adiciona ao elemento
  }
}

function voltarInicio() {
  document.getElementById("entrar").style.display = "block";
  document.getElementById("cadastrar").style.display = "block";
  document.getElementById("voltar").style.display = "none";

  trocarConteudo(`<div id="map"></div>`);
}
function logout() {
  fetch("http://localhost:8080/auth/logout", {
    method: "POST",
    credentials: "include",
  }).then(() => {
    document.cookie = "usuarioLogado=; max-age=0; path=/";
    document.getElementsByClassName(".loginBtn")[0].style.display = "block";
  });
}
async function verificarLogin() {
  console.log(user.nome);
  if (user != null) {
    document.querySelector(".loginBtn").style.display = "none";
    document.querySelector(".configpop").style.display = "flex";
    console.log(user);
    if (user.admin) {
      adminCard();
    }
  } else {
    document.querySelector(".configpop").style.display = "none";
    document.querySelector(".loginBtn").style.display = "block";
  }
}

function configTela() {
  if (window.innerWidth <= 730) {
    // document.getElementById("ConfigDKT").style.display = "none";

    trocarConteudo(`
  <div class="configTela">
    <h1>Configurações</h1>
    <div id="preferencias">
      <div id="opcoesTela"></div>
    </div>
    <div id="opcoesCell">
      <img src="./img/DadosPessoais.png" onclick="trocarOpcoes(0)" class="opcaoCell">
      <img src="./img/Personalização.png" onclick="trocarOpcoes(1)" class="opcaoCell">
      <img src="./img/notificacao.png" onclick="trocarOpcoes(2)" class="opcaoCell">
      <img src="./img/seguranca.png" onclick="trocarOpcoes(3)" class="opcaoCell">
      <img src="./img/outros.png" onclick="trocarOpcoes(4)" class="opcaoCell">
    </div>
  </div>`);
  } else {
    const ConfigDKT = document.getElementById("configDKT");

    ConfigDKT.style.display = "flex";
    ConfigDKT.classList.add("fade-inX");
    setTimeout(() => {
      ConfigDKT.classList.remove("fade-inX");
    }, 600);

    document
      .getElementById("ConfigDKTFechar")
      .addEventListener("click", function () {
        ConfigDKT.classList.add("fade-outX");

        setTimeout(() => {
          ConfigDKT.style.display = "none";
          ConfigDKT.classList.remove("fade-outX");
        }, 400);
      });
  }
}
function trocarOpcoes(i) {
  const opcoes = document.querySelectorAll(".opcao");

  opcoes.forEach((el, index) => {
    el.classList.toggle("ativo", index === i);
  });
  const opcoesCell = document.querySelectorAll(".opcaoCell");

  opcoesCell.forEach((el, index) => {
    el.classList.toggle("ativoCell", index === i);
  });

  var tela = [
    `
    <h4> Dados Pessoais:</h4>
    <table>
    <tr>
      <td>
        <label for="NomeEditar">Nome:</label>
      </td>
      <td>
        <label for="EmailEditar">Email:</label><br>
      </td>
    </tr>
    <tr>
      <td>
        <input type="text" value="${user.nome}" id="NomeEditar" disabled/>
      </td>
      <td>
         <input type="Email" value="${user.email}" id="EmailEditar" disabled/>
      </td>
      </table>
      <hr>
      <br>
      <h4>Endereço</h4>
      
      <table>
        <tr>
          <td>
            <label for="cepEditar">CEP:</label>
          </td>
          <td>
            <label for="bairroEditar">Bairro:</label>
          </td>
        </tr>
        <tr>
          <td>
            <input type="number" value="${user.cep}" id="cepEditar" disabled/>
          </td>
          <td>
            <input type="text" id="bairroEditar" value="${user.bairro}" disabled/>
          </td>
        </tr>
        <tr>
          <td>
            <label for="ruaEditar">Rua:</label>
          </td>
          <td>
            <label for="cidadeEditar">Cidade:</label>
          </td>
        </tr>
        <tr>
          <td>
            <input type="text" value="${user.rua}" id="ruaEditar" disabled/>
          </td>
          <td>
            <input type="text" value="${user.cidade}" id="cidadeEditar" disabled/>
          </td>
        </tr>
        
      </table>
    `,
    `
    <h4 style="text-align:center; margin-bottom: 20px">Categorias que me satisfazem:</h4>
<table>
  <tr>
    <td>
      <input type="checkbox" id="segurancaCheck" disabled>
      <label for="segurancaCheck">Segurança</label>
    </td>
    <td>
      <input type="checkbox" id="transporteCheck" disabled>
      <label for="transporteCheck">Transporte</label>
    </td>
  </tr>
  <tr>
    <td>
      <input type="checkbox" id="infraestruturaCheck" disabled>
      <label for="infraestruturaCheck">Infraestrutura</label>
    </td>
    <td>
      <input type="checkbox" id="educacaoCheck" disabled>
      <label for="educacaoCheck">Educação</label>
    </td>
  </tr>
  <tr>
    <td>
      <input type="checkbox" id="saudeCheck" disabled>
      <label for="saudeCheck">Saúde</label>
    </td>
    <td>
      <input type="checkbox" id="comercioCheck" disabled>
      <label for="comercioCheck">Comércio</label>
    </td>
  </tr>
  <tr>
    <td>
      <input type="checkbox" id="lazerCheck" disabled>
      <label for="lazerCheck">Lazer</label>
    </td>
    <td></td>
  </tr>
</table>
    `,
    `<h4> Controle sobre alertas</h4>
    
    <table>
    <tr>
    <td>
      <input type="checkbox" id="notf_emails_avl" disabled>
      <label for="notf_emails_avl">Receber emails com novas avaliações no seu bairro favorito</label>
    </td>
    </tr>
    <tr>
    <td>
      <input type="checkbox" id="notf_respostas_avl" disabled>
      <label for="notf_respostas_avl">Notificações sobre respostas em suas avaliação</label>
    </td>
    </tr>
    <tr>
    <td>
      <input type="checkbox" id="newsletter" disabled>
      <label for="newsletter">Newsletter com dicas e novidades</label>
    </td>
    </tr>
    </table>
    `,
    `<h4>Proteção de conta</h4>
    <table>
      <tr>
        <td>
          <label for="autToggle">Autenticação 2FA</label>
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" id="autToggle" onclick="togglePrivacidade()">
            <span class="slider round"></span>
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <label for="anonimoToggle">Tornar avaliações anônimas</label>
        </td>
                <td>
          <label class="switch">
            <input type="checkbox" id="anonimoToggle" onclick="togglePrivacidade()">
            <span class="slider round"></span>
          </label>
        </td>
      </tr>
    </table>
    `,
    `
    <h4 class="outrosBtn" onclick="trocarOpcoes(5)">Termos de uso e política de privacidade</h4><br>
    <h4 class="outrosBtn" onclick="trocarOpcoes(6)">Versão do site</h4>
    <h4 class="outrosBtn" onclick="trocarOpcoes(7)">Fazer logout</h4>`,
    `<h4> Termos e política de privacidade</h4>
    
    <p id="termosTXT">
    
<b>1. Introdução</b> <br>

O Infobairro é uma plataforma que tem como objetivo reunir avaliações de usuários sobre bairros, apresentando opiniões, dados e percepções de forma colaborativa.
Ao utilizar o site, você concorda com os presentes Termos de Uso e com a Política de Privacidade.

2. Termos de Uso <br>
2.1. Objetivo da Plataforma <br>

O Infobairro permite que usuários consultem, avaliem e compartilhem experiências relacionadas a diferentes bairros, visando ajudar outras pessoas a tomarem decisões mais informadas.

2.2. Precisão das Informações <br>

As informações publicadas na plataforma podem ter sido fornecidas por usuários ou coletadas de fontes públicas.
<br>
Não garantimos que os dados sobre os bairros sejam sempre precisos, completos ou atualizados.
<br>
A percepção sobre segurança, lazer, transporte, custo de vida ou qualquer outro aspecto pode variar entre pessoas.
<br>
2.3. Responsabilidade do Usuário <br>

Ao usar o Infobairro, você se compromete a: <br>

Fornecer informações verdadeiras em suas avaliações. <br>

Não publicar conteúdo ofensivo, discriminatório, ilegal ou que viole direitos de terceiros.
<br>
Respeitar a comunidade e os demais usuários.
<br>
2.4. Limitação de Responsabilidade<br>

O Infobairro não se responsabiliza por:<br>

Decisões tomadas pelos usuários com base nas informações do site.<br>

Divergências entre opiniões publicadas e a realidade vivenciada.<br>

Eventuais danos ou prejuízos decorrentes do uso da plataforma.<br>

3. Política de Privacidade<br>
3.1. Coleta de Dados<br>

O Infobairro pode coletar informações pessoais fornecidas voluntariamente, tais como:
<br>
Nome e e-mail (quando o usuário cria uma conta ou entra em contato).
<br>
Dados de uso, como páginas visitadas, tempo de navegação e interações no site (para fins estatísticos).
<br>
3.2. Uso das Informações
<br>
Os dados coletados são utilizados para:
<br>
Manter a conta do usuário ativa.
<br>
Exibir avaliações de forma organizada.
<br>
Melhorar a experiência e funcionalidades da plataforma.
<br>
Enviar comunicações relevantes (com consentimento do usuário).
<br>
3.3. Compartilhamento<br>

O Infobairro não vende nem compartilha dados pessoais com terceiros para fins comerciais.
<br>
Dados podem ser compartilhados apenas em casos legais ou mediante ordem judicial.
<br>
3.4. Armazenamento e Segurança<br>

Adotamos medidas de segurança para proteger os dados dos usuários contra acessos não autorizados.
<br>
O usuário é responsável por manter sua senha em sigilo.
<br>
3.5. Direitos do Usuário<br>

Você pode solicitar, a qualquer momento:
<br>
Correção ou exclusão de seus dados.
<br>
Exclusão de sua conta.
<br>
Revogação de consentimento para uso de informações.
<br>
4. Alterações nos Termos
<br>
O Infobairro pode atualizar esta Política de Privacidade e Termos de Uso periodicamente. Recomendamos que os usuários revisem este documento regularmente.
<br>
5. Contato
<br>
Para dúvidas, sugestões ou solicitações relacionadas a privacidade, entre em contato: suporte@infobairro.com

    
    </p>
    
    `,
    `
    <div id="versaoSite">
    <img src="./img/Logo.png"/>
    <h2>Versão: 1.0.0</h2>
    </div>
    `,
  ];

  if (i == 7) {
    localStorage.removeItem("User");
    showAlert("Realizando logout...", "info", 1500);
    setTimeout(() => {
      window.location.reload();
    }, 1700);
  }

  if (i == 5 || i == 6) {
    if (window.innerWidth <= 730) opcoesCell[4].classList.add("ativoCell");
    else opcoes[4].classList.add("ativo");
  }
  if (window.innerWidth <= 730) {
    tela[0] = `    
<h4> Dados Pessoais:</h4>
  <table>
    <tr>
      <td>
        <label for="NomeEditar">Nome:</label>
      </td>
    </tr>
    <tr>
      <td>
        <input type="text" value="s" id="NomeEditar" disabled style="width=90%"/>
      </td>
    </tr>
    <tr>
      <td>
        <label for="EmailEditar">Email:</label><br>
      </td>
    </tr>
    <tr>
      <td>
         <input type="Email" value="@gmail" id="EmailEditar" disabled/>
      </td>
    </tr>
      </table>
      <hr>
      <br>
      <h4>Endereço</h4>
      
      <table>
        <tr>
          <td>
            <label for="cepEditar">CEP:</label>
          </td>
          <td>
            <label for="bairroEditar">Bairro:</label>
          </td>
        </tr>
        <tr>
          <td>
            <input type="number" id="cepEditar" disabled/>
          </td>
          <td>
            <input type="text" id="bairroEditar" disabled/>
          </td>
        </tr>
        <tr>
          <td>
            <label for="ruaEditar">Rua:</label>
          </td>
          <td>
            <label for="cidadeEditar">Cidade:</label>
          </td>
        </tr>
        <tr>
          <td>
            <input type="text" id="ruaEditar" disabled/>
          </td>
          <td>
            <input type="text" id="cidadeEditar" disabled/>
          </td>
        </tr>
        
      </table>
`;
  }

  const telaOpt = document.getElementById("opcoesTela");

  if (telaOpt.innerHTML !== tela[i]) {
    telaOpt.classList.add("fade-out");

    setTimeout(() => {
      if (i != 0) {
        telaOpt.style.justifyContent = "center";
        telaOpt.style.alignItems = "center";
      } else {
        telaOpt.style.justifyContent = "initial";
        telaOpt.style.alignItems = "initial";
      }

      telaOpt.innerHTML = tela[i];
      telaOpt.classList.remove("fade-out");
      telaOpt.classList.add("fade-in");
    }, 300); // tempo do fade-out (ajuste conforme o CSS)
  } else {
    telaOpt.innerHTML = tela[i];
  }
}

function togglePrivacidade() {
  const autToggler = document.getElementById("autToggle");
  const anonimoToggler = document.getElementById("anonimoToggle");

  // Adiciona um "ouvinte de evento" para o clique/mudança de estado
  autToggler.addEventListener("change", function () {
    // Verifica se o switch está marcado (ligado)
    if (this.checked) {
      console.log("Status aut: Ligado");
    } else {
      console.log("Status aut: Desligado");
    }
  });
  anonimoToggler.addEventListener("change", function () {
    // Verifica se o switch está marcado (ligado)
    if (this.checked) {
      console.log("Status anonimo: Ligado");
    } else {
      console.log("Status anonimo: Desligado");
    }
  });
}

window.addEventListener("load", verificarLogin);
