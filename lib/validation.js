export const statusValidosQuadra = ["ativa", "inativa"];

export function estaVazio(valor) {
  return typeof valor !== "string" || valor.trim() === "";
}

export function ehData(valor) {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor);
}

export function ehHorario(valor) {
  return /^\d{2}:\d{2}$/.test(valor);
}

export function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

export function validarQuadra(dados) {
  const erros = [];

  if (estaVazio(dados.nome)) erros.push("Nome da quadra e obrigatorio.");
  if (estaVazio(dados.tipo)) erros.push("Tipo da quadra e obrigatorio.");
  if (estaVazio(dados.localizacao)) erros.push("Localizacao e obrigatoria.");
  if (!statusValidosQuadra.includes(dados.status)) erros.push("Status da quadra invalido.");

  return erros;
}

export function validarReserva(dados) {
  const erros = [];
  const cpf = somenteNumeros(dados.cpf_cliente);

  if (estaVazio(dados.nome_cliente)) erros.push("Nome do cliente e obrigatorio.");
  if (cpf.length !== 11) erros.push("CPF do cliente deve ter 11 numeros.");
  if (!ehData(dados.data_reserva)) erros.push("Data da reserva e obrigatoria.");
  if (!ehHorario(dados.hora_inicio)) erros.push("Horario de inicio e obrigatorio.");
  if (!ehHorario(dados.hora_fim)) erros.push("Horario de termino e obrigatorio.");
  if (!Number.isInteger(Number(dados.quadra_id))) erros.push("Quadra e obrigatoria.");

  if (ehHorario(dados.hora_inicio) && ehHorario(dados.hora_fim) && dados.hora_fim <= dados.hora_inicio) {
    erros.push("Horario final deve ser maior que o horario inicial.");
  }

  return erros;
}

export function enviarErrosValidacao(res, erros) {
  return res.status(400).json({ message: "Dados invalidos.", errors: erros });
}
