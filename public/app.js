const rotasApi = {
  quadras: "/api/quadras",
  reservas: "/api/reservas",
  disponibilidade: "/api/disponibilidade"
};

const estado = {
  quadras: [],
  reservas: []
};

const elementos = {
  alternarTema: document.querySelector("#alternarTema"),
  ordenacaoQuadras: document.querySelector("#ordenacaoQuadras"),
  ordenacaoReservas: document.querySelector("#ordenacaoReservas"),
  formularioQuadra: document.querySelector("#formularioQuadra"),
  quadraId: document.querySelector("#quadraId"),
  nomeQuadra: document.querySelector("#nomeQuadra"),
  tipoQuadra: document.querySelector("#tipoQuadra"),
  localizacaoQuadra: document.querySelector("#localizacaoQuadra"),
  statusQuadra: document.querySelector("#statusQuadra"),
  listaQuadras: document.querySelector("#listaQuadras"),
  limparFormularioQuadra: document.querySelector("#limparFormularioQuadra"),
  formularioReserva: document.querySelector("#formularioReserva"),
  reservaId: document.querySelector("#reservaId"),
  modoReserva: document.querySelector("#modoReserva"),
  mensagemFormulario: document.querySelector("#mensagemFormulario"),
  nomeCliente: document.querySelector("#nomeCliente"),
  cpfCliente: document.querySelector("#cpfCliente"),
  quadraReserva: document.querySelector("#quadraReserva"),
  dataReserva: document.querySelector("#dataReserva"),
  horarioInicio: document.querySelector("#horarioInicio"),
  horarioFim: document.querySelector("#horarioFim"),
  listaReservas: document.querySelector("#listaReservas"),
  limparFormularioReserva: document.querySelector("#limparFormularioReserva"),
  atualizarDisponibilidade: document.querySelector("#atualizarDisponibilidade"),
  quadroDisponibilidade: document.querySelector("#quadroDisponibilidade"),
  aviso: document.querySelector("#aviso")
};

function mostrarAviso(mensagem) {
  elementos.aviso.textContent = mensagem;
  elementos.aviso.classList.add("show");
  window.setTimeout(function () {
    elementos.aviso.classList.remove("show");
  }, 3200);
}

function mostrarMensagemFormulario(mensagem, tipo) {
  elementos.mensagemFormulario.textContent = mensagem || "";
  elementos.mensagemFormulario.className = "form-message";
  if (mensagem) elementos.mensagemFormulario.classList.add(tipo || "error");
}

function atualizarModoReserva() {
  const estaEditando = Boolean(elementos.reservaId.value);
  elementos.modoReserva.textContent = estaEditando ? "Editando reserva existente" : "Nova reserva";
  elementos.modoReserva.classList.toggle("editing", estaEditando);
}

function formatarCpf(valor) {
  const numeros = String(valor || "").replace(/\D/g, "").slice(0, 11);
  return numeros
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function dataHoje() {
  return new Date().toISOString().slice(0, 10);
}

async function requisitarJson(url, opcoes) {
  const resposta = await fetch(url, Object.assign({ headers: { "Content-Type": "application/json" } }, opcoes || {}));
  if (resposta.status === 204) return null;

  const dados = await resposta.json();
  if (!resposta.ok) {
    const detalhe = dados.errors ? dados.errors.join(" ") : dados.message;
    throw new Error(detalhe || "Nao foi possivel completar a operacao.");
  }

  return dados;
}

function validarFormularioQuadra(dados) {
  if (!dados.nome || !dados.tipo || !dados.localizacao || !dados.status) {
    return "Preencha todos os campos da quadra.";
  }

  return "";
}

function validarFormularioReserva(dados) {
  const cpf = String(dados.cpf_cliente || "").replace(/\D/g, "");

  if (!dados.nome_cliente || !dados.cpf_cliente || !dados.data_reserva || !dados.hora_inicio || !dados.hora_fim || !dados.quadra_id) {
    return "Preencha todos os campos da reserva.";
  }

  if (cpf.length !== 11) return "Informe um CPF com 11 numeros.";
  if (dados.data_reserva < dataHoje()) return "Nao e permitido reservar datas passadas.";
  if (dados.hora_fim <= dados.hora_inicio) return "O horario final deve ser maior que o horario inicial.";

  return "";
}

function dadosQuadra() {
  return {
    nome: elementos.nomeQuadra.value.trim(),
    tipo: elementos.tipoQuadra.value,
    localizacao: elementos.localizacaoQuadra.value.trim(),
    status: elementos.statusQuadra.value
  };
}

function dadosReserva() {
  return {
    nome_cliente: elementos.nomeCliente.value.trim(),
    cpf_cliente: elementos.cpfCliente.value,
    data_reserva: elementos.dataReserva.value,
    hora_inicio: elementos.horarioInicio.value,
    hora_fim: elementos.horarioFim.value,
    quadra_id: Number(elementos.quadraReserva.value)
  };
}

async function carregarQuadras() {
  const ordenacao = elementos.ordenacaoQuadras.value;
  localStorage.setItem("quadrasOrdenacao", ordenacao);
  estado.quadras = await requisitarJson(rotasApi.quadras + "?ordenar=" + ordenacao);
  renderizarQuadras();
  renderizarSelectQuadras();
}

async function carregarReservas() {
  const ordenacao = elementos.ordenacaoReservas.value;
  localStorage.setItem("reservasOrdenacao", ordenacao);
  estado.reservas = await requisitarJson(rotasApi.reservas + "?ordenar=" + ordenacao);
  renderizarReservas();
}

function renderizarQuadras() {
  elementos.listaQuadras.innerHTML = "";

  estado.quadras.forEach(function (quadra) {
    const item = document.createElement("article");
    item.className = "item";
    const proximoStatus = quadra.status === "ativa" ? "inativa" : "ativa";

    item.innerHTML =
      '<div><strong>' + quadra.nome + '</strong><span class="item-meta">' + quadra.tipo + ' - ' + quadra.localizacao + ' - ' + quadra.total_reservas + ' reserva(s)</span></div>' +
      '<span class="status ' + (quadra.status === "ativa" ? "active" : "inactive") + '">' + quadra.status + '</span>' +
      '<div class="item-actions">' +
      '<button type="button" data-acao="selecionar-quadra" data-id="' + quadra.id + '">Selecionar</button>' +
      '<button type="button" class="secondary" data-acao="editar-quadra" data-id="' + quadra.id + '">Editar</button>' +
      '<button type="button" class="secondary" data-acao="alternar-quadra" data-id="' + quadra.id + '" data-status="' + proximoStatus + '">' + (quadra.status === "ativa" ? "Inativar" : "Ativar") + '</button>' +
      '<button type="button" class="secondary" data-acao="remover-quadra" data-id="' + quadra.id + '">Remover</button>' +
      '</div>';

    elementos.listaQuadras.appendChild(item);
  });
}

function renderizarSelectQuadras() {
  const quadraSelecionada = elementos.quadraReserva.value || localStorage.getItem("ultimaQuadra");
  elementos.quadraReserva.innerHTML = '<option value="">Selecione</option>';

  estado.quadras
    .filter(function (quadra) { return quadra.status === "ativa"; })
    .forEach(function (quadra) {
      const opcao = document.createElement("option");
      opcao.value = quadra.id;
      opcao.textContent = quadra.nome;
      if (String(quadra.id) === quadraSelecionada) opcao.selected = true;
      elementos.quadraReserva.appendChild(opcao);
    });
}

function renderizarReservas() {
  elementos.listaReservas.innerHTML = "";

  estado.reservas.forEach(function (reserva) {
    const item = document.createElement("article");
    item.className = "item";

    item.innerHTML =
      '<div><strong>' + reserva.nome_cliente + '</strong><span class="item-meta">CPF: ' + (reserva.cpf_cliente || "nao informado") + ' - ' + reserva.quadra_nome + ' - ' + reserva.data_reserva + ' das ' + reserva.hora_inicio + ' as ' + reserva.hora_fim + '</span></div>' +
      '<span class="status ' + (reserva.status === "confirmada" ? "confirmed" : "canceled") + '">' + reserva.status + '</span>' +
      '<div class="item-actions">' +
      '<button type="button" class="secondary" data-acao="editar-reserva" data-id="' + reserva.id + '">Editar</button>' +
      '<button type="button" class="secondary" data-acao="cancelar-reserva" data-id="' + reserva.id + '">Cancelar</button>' +
      '<button type="button" class="secondary" data-acao="remover-reserva" data-id="' + reserva.id + '">Remover</button>' +
      '</div>';

    elementos.listaReservas.appendChild(item);
  });
}

async function carregarDisponibilidade() {
  const quadraId = elementos.quadraReserva.value;
  const data = elementos.dataReserva.value;
  elementos.quadroDisponibilidade.innerHTML = "";

  if (!quadraId && !data) {
    const horario = document.createElement("div");
    horario.className = "slot unavailable";
    horario.textContent = "Selecione uma quadra e uma data";
    elementos.quadroDisponibilidade.appendChild(horario);
    return;
  }

  if (!quadraId) {
    const horario = document.createElement("div");
    horario.className = "slot unavailable";
    horario.textContent = "Selecione a quadra para ver os horarios";
    elementos.quadroDisponibilidade.appendChild(horario);
    return;
  }

  if (!data) {
    const horario = document.createElement("div");
    horario.className = "slot unavailable";
    horario.textContent = "Escolha a data para ver os horarios livres";
    elementos.quadroDisponibilidade.appendChild(horario);
    return;
  }

  const horarios = await requisitarJson(rotasApi.disponibilidade + "?quadra_id=" + quadraId + "&data=" + data);

  horarios.forEach(function (horario) {
    const item = document.createElement("div");
    item.className = "slot " + (horario.status === "livre" ? "free" : "busy");
    item.innerHTML = "<strong>" + horario.horario + "</strong><br>" + horario.status;
    elementos.quadroDisponibilidade.appendChild(item);
  });
}

function limparQuadra() {
  elementos.quadraId.value = "";
  elementos.formularioQuadra.reset();
  elementos.statusQuadra.value = "ativa";
}

function limparReserva() {
  elementos.reservaId.value = "";
  elementos.formularioReserva.reset();
  renderizarSelectQuadras();
  mostrarMensagemFormulario("");
  atualizarModoReserva();
}

elementos.formularioQuadra.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  const dados = dadosQuadra();
  const erro = validarFormularioQuadra(dados);
  if (erro) return mostrarAviso(erro);

  try {
    const id = elementos.quadraId.value;
    const quadraSalva = await requisitarJson(id ? rotasApi.quadras + "/" + id : rotasApi.quadras, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(dados)
    });

    limparQuadra();
    if (quadraSalva.status === "ativa") {
      localStorage.setItem("ultimaQuadra", String(quadraSalva.id));
    }
    await carregarQuadras();
    elementos.quadraReserva.value = quadraSalva.status === "ativa" ? String(quadraSalva.id) : elementos.quadraReserva.value;
    await carregarDisponibilidade();
    mostrarAviso("Quadra salva com sucesso.");
  } catch (erro) {
    mostrarAviso(erro.message);
  }
});

elementos.formularioReserva.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  mostrarMensagemFormulario("");

  const dados = dadosReserva();
  const erro = validarFormularioReserva(dados);
  if (erro) {
    mostrarMensagemFormulario(erro, "error");
    return mostrarAviso(erro);
  }

  try {
    const id = elementos.reservaId.value;
    await requisitarJson(id ? rotasApi.reservas + "/" + id : rotasApi.reservas, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(dados)
    });

    localStorage.setItem("ultimaQuadra", String(dados.quadra_id));
    limparReserva();
    await Promise.all([carregarQuadras(), carregarReservas()]);
    await carregarDisponibilidade();
    mostrarAviso("Reserva salva com sucesso.");
  } catch (erro) {
    mostrarMensagemFormulario(erro.message, "error");
    mostrarAviso(erro.message);
  }
});

elementos.listaQuadras.addEventListener("click", async function (evento) {
  const botao = evento.target.closest("button");
  if (!botao) return;

  const id = botao.dataset.id;
  const acao = botao.dataset.acao;
  const quadra = estado.quadras.find(function (item) { return String(item.id) === id; });

  try {
    if (acao === "selecionar-quadra") {
      elementos.quadraReserva.value = id;
      localStorage.setItem("ultimaQuadra", id);
      await carregarDisponibilidade();
    }

    if (acao === "editar-quadra") {
      elementos.quadraId.value = quadra.id;
      elementos.nomeQuadra.value = quadra.nome;
      elementos.tipoQuadra.value = quadra.tipo;
      elementos.localizacaoQuadra.value = quadra.localizacao;
      elementos.statusQuadra.value = quadra.status;
    }

    if (acao === "alternar-quadra") {
      await requisitarJson(rotasApi.quadras + "/" + id + "/status", {
        method: "PATCH",
        body: JSON.stringify({ status: botao.dataset.status })
      });
      await carregarQuadras();
      mostrarAviso("Status atualizado.");
    }

    if (acao === "remover-quadra") {
      await requisitarJson(rotasApi.quadras + "/" + id, { method: "DELETE" });
      await Promise.all([carregarQuadras(), carregarReservas()]);
      mostrarAviso("Quadra removida.");
    }
  } catch (erro) {
    mostrarAviso(erro.message);
  }
});

elementos.listaReservas.addEventListener("click", async function (evento) {
  const botao = evento.target.closest("button");
  if (!botao) return;

  const id = botao.dataset.id;
  const reserva = estado.reservas.find(function (item) { return String(item.id) === id; });

  try {
    if (botao.dataset.acao === "editar-reserva") {
      elementos.reservaId.value = reserva.id;
      atualizarModoReserva();
      mostrarMensagemFormulario("Voce esta editando uma reserva. Clique em Limpar para criar uma nova.", "info");
      elementos.nomeCliente.value = reserva.nome_cliente;
      elementos.cpfCliente.value = formatarCpf(reserva.cpf_cliente);
      elementos.quadraReserva.value = reserva.quadra_id;
      elementos.dataReserva.value = reserva.data_reserva;
      elementos.horarioInicio.value = reserva.hora_inicio;
      elementos.horarioFim.value = reserva.hora_fim;
      await carregarDisponibilidade();
    }

    if (botao.dataset.acao === "cancelar-reserva") {
      await requisitarJson(rotasApi.reservas + "/" + id + "/cancelar", { method: "PATCH" });
      await Promise.all([carregarQuadras(), carregarReservas()]);
      await carregarDisponibilidade();
      mostrarAviso("Reserva cancelada.");
    }

    if (botao.dataset.acao === "remover-reserva") {
      await requisitarJson(rotasApi.reservas + "/" + id, { method: "DELETE" });
      await Promise.all([carregarQuadras(), carregarReservas()]);
      await carregarDisponibilidade();
      mostrarAviso("Reserva removida.");
    }
  } catch (erro) {
    mostrarAviso(erro.message);
  }
});

elementos.alternarTema.addEventListener("click", function () {
  const proximoTema = document.body.classList.toggle("dark") ? "dark" : "light";
  localStorage.setItem("tema", proximoTema);
});

elementos.ordenacaoQuadras.addEventListener("change", carregarQuadras);
elementos.ordenacaoReservas.addEventListener("change", carregarReservas);
elementos.limparFormularioQuadra.addEventListener("click", limparQuadra);
elementos.limparFormularioReserva.addEventListener("click", limparReserva);
elementos.cpfCliente.addEventListener("input", function () {
  elementos.cpfCliente.value = formatarCpf(elementos.cpfCliente.value);
});
elementos.quadraReserva.addEventListener("change", function () {
  localStorage.setItem("ultimaQuadra", elementos.quadraReserva.value);
  carregarDisponibilidade();
});
elementos.dataReserva.addEventListener("change", carregarDisponibilidade);
elementos.atualizarDisponibilidade.addEventListener("click", carregarDisponibilidade);

async function iniciarAplicacao() {
  const hoje = new Date().toISOString().slice(0, 10);
  elementos.dataReserva.value = hoje;
  elementos.dataReserva.min = hoje;
  elementos.ordenacaoQuadras.value = localStorage.getItem("quadrasOrdenacao") || "nome";
  elementos.ordenacaoReservas.value = localStorage.getItem("reservasOrdenacao") || "data";

  if (localStorage.getItem("tema") === "dark") document.body.classList.add("dark");

  atualizarModoReserva();
  await Promise.all([carregarQuadras(), carregarReservas()]);
  await carregarDisponibilidade();
}

iniciarAplicacao().catch(function (erro) {
  mostrarAviso(erro.message);
});
