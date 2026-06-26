import { banco, garantirEstrutura } from "../../lib/db";
import { ehData, enviarErrosValidacao } from "../../lib/validation";

export default async function handler(req, res) {
  try {
    await garantirEstrutura();

    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ message: "Metodo nao permitido." });
    }

    const { quadra_id, data } = req.query;
    if (!quadra_id || !ehData(data)) {
      return enviarErrosValidacao(res, ["Informe quadra e data para consultar disponibilidade."]);
    }

    const db = banco();
    const reservas = await db`
      SELECT hora_inicio, hora_fim
      FROM reservas
      WHERE quadra_id = ${Number(quadra_id)}
        AND data_reserva = ${data}
        AND status = 'confirmada'
    `;

    const horarios = [];
    for (let hora = 8; hora <= 22; hora += 1) {
      const horario = `${String(hora).padStart(2, "0")}:00`;
      const ocupado = reservas.some((reserva) => {
        const inicio = String(reserva.hora_inicio).slice(0, 5);
        const fim = String(reserva.hora_fim).slice(0, 5);
        return inicio <= horario && fim > horario;
      });

      horarios.push({ horario, status: ocupado ? "ocupado" : "livre" });
    }

    return res.status(200).json(horarios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
