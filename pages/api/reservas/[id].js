import { banco, garantirEstrutura, normalizarReserva } from "../../../lib/db";
import { enviarErrosValidacao, somenteNumeros, validarReserva } from "../../../lib/validation";
import { existeConflitoReserva } from "./index";

export default async function handler(req, res) {
  try {
    await garantirEstrutura();
    const db = banco();
    const id = Number(req.query.id);

    if (!Number.isInteger(id)) return enviarErrosValidacao(res, ["ID da reserva invalido."]);

    if (req.method === "PUT") {
      const erros = validarReserva(req.body);
      if (erros.length) return enviarErrosValidacao(res, erros);

      const [existing] = await db`SELECT * FROM reservas WHERE id = ${id}`;
      if (!existing) return res.status(404).json({ message: "Reserva nao encontrada." });

      const [quadra] = await db`SELECT * FROM quadras WHERE id = ${Number(req.body.quadra_id)}`;
      if (!quadra) return enviarErrosValidacao(res, ["Quadra informada nao existe."]);
      if (quadra.status !== "ativa") return enviarErrosValidacao(res, ["A quadra precisa estar ativa para receber reservas."]);

      if (await existeConflitoReserva(db, req.body, id)) {
        return res.status(409).json({
          message: "Horario indisponivel.",
          errors: ["Ja existe uma reserva confirmada para essa quadra nesse horario."]
        });
      }

      const [reservaAtualizada] = await db`
        UPDATE reservas
        SET nome_cliente = ${req.body.nome_cliente.trim()},
            cpf_cliente = ${somenteNumeros(req.body.cpf_cliente)},
            data_reserva = ${req.body.data_reserva},
            hora_inicio = ${req.body.hora_inicio},
            hora_fim = ${req.body.hora_fim},
            quadra_id = ${Number(req.body.quadra_id)},
            status = 'confirmada'
        WHERE id = ${id}
        RETURNING *
      `;

      return res.status(200).json(normalizarReserva(reservaAtualizada));
    }

    if (req.method === "DELETE") {
      const reservaRemovida = await db`DELETE FROM reservas WHERE id = ${id} RETURNING id`;
      if (!reservaRemovida.length) return res.status(404).json({ message: "Reserva nao encontrada." });
      return res.status(204).end();
    }

    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).json({ message: "Metodo nao permitido." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
