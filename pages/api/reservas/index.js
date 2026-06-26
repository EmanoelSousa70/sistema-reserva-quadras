import { banco, garantirEstrutura, normalizarReserva } from "../../../lib/db";
import { enviarErrosValidacao, somenteNumeros, validarReserva } from "../../../lib/validation";

async function existeConflitoReserva(db, dados, idIgnorado) {
  const parametros = [
    dados.quadra_id,
    dados.data_reserva,
    dados.hora_fim,
    dados.hora_inicio
  ];

  let consulta = `
    SELECT id
    FROM reservas
    WHERE quadra_id = $1
      AND data_reserva = $2
      AND status = 'confirmada'
      AND hora_inicio < $3
      AND hora_fim > $4
  `;

  if (idIgnorado) {
    consulta += " AND id <> $5";
    parametros.push(idIgnorado);
  }

  const conflito = await db(consulta, parametros);
  return conflito.length > 0;
}

export default async function handler(req, res) {
  try {
    await garantirEstrutura();
    const db = banco();

    if (req.method === "GET") {
      const ordenacoesPermitidas = {
        data: "r.data_reserva ASC, r.hora_inicio ASC",
        cliente: "r.nome_cliente ASC",
        quadra: "q.nome ASC, r.data_reserva ASC, r.hora_inicio ASC"
      };
      const ordenacao = ordenacoesPermitidas[req.query.ordenar] || ordenacoesPermitidas.data;

      const reservas = await db(`
        SELECT r.*, q.nome AS quadra_nome, q.tipo AS quadra_tipo
        FROM reservas r
        INNER JOIN quadras q ON q.id = r.quadra_id
        ORDER BY ${ordenacao}
      `);

      return res.status(200).json(reservas.map(normalizarReserva));
    }

    if (req.method === "POST") {
      const erros = validarReserva(req.body);
      if (erros.length) return enviarErrosValidacao(res, erros);

      const [quadra] = await db`SELECT * FROM quadras WHERE id = ${Number(req.body.quadra_id)}`;
      if (!quadra) return enviarErrosValidacao(res, ["Quadra informada nao existe."]);
      if (quadra.status !== "ativa") return enviarErrosValidacao(res, ["A quadra precisa estar ativa para receber reservas."]);

      if (await existeConflitoReserva(db, req.body)) {
        return res.status(409).json({
          message: "Horario indisponivel.",
          errors: ["Ja existe uma reserva confirmada para essa quadra nesse horario."]
        });
      }

      const [reservaCriada] = await db`
        INSERT INTO reservas (nome_cliente, cpf_cliente, data_reserva, hora_inicio, hora_fim, quadra_id)
        VALUES (${req.body.nome_cliente.trim()}, ${somenteNumeros(req.body.cpf_cliente)}, ${req.body.data_reserva}, ${req.body.hora_inicio}, ${req.body.hora_fim}, ${Number(req.body.quadra_id)})
        RETURNING *
      `;

      return res.status(201).json(normalizarReserva(reservaCriada));
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Metodo nao permitido." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export { existeConflitoReserva };
