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

