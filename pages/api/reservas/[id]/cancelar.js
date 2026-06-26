import { banco, garantirEstrutura, normalizarReserva } from "../../../../lib/db";
import { enviarErrosValidacao } from "../../../../lib/validation";

export default async function handler(req, res) {
  try {
    await garantirEstrutura();

    if (req.method !== "PATCH") {
      res.setHeader("Allow", ["PATCH"]);
      return res.status(405).json({ message: "Metodo nao permitido." });
    }

    const id = Number(req.query.id);
    if (!Number.isInteger(id)) return enviarErrosValidacao(res, ["ID da reserva invalido."]);

    const db = banco();
    const [reservaAtualizada] = await db`
      UPDATE reservas
      SET status = 'cancelada'
      WHERE id = ${id}
      RETURNING *
    `;

    if (!reservaAtualizada) return res.status(404).json({ message: "Reserva nao encontrada." });
    return res.status(200).json(normalizarReserva(reservaAtualizada));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
