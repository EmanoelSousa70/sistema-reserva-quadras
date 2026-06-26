import { banco, garantirEstrutura } from "../../../../lib/db";
import { enviarErrosValidacao, statusValidosQuadra } from "../../../../lib/validation";

export default async function handler(req, res) {
  try {
    await garantirEstrutura();

    if (req.method !== "PATCH") {
      res.setHeader("Allow", ["PATCH"]);
      return res.status(405).json({ message: "Metodo nao permitido." });
    }

    const id = Number(req.query.id);
    if (!Number.isInteger(id)) return enviarErrosValidacao(res, ["ID da quadra invalido."]);
    if (!statusValidosQuadra.includes(req.body.status)) return enviarErrosValidacao(res, ["Status da quadra invalido."]);

    const db = banco();
    const [quadraAtualizada] = await db`
      UPDATE quadras
      SET status = ${req.body.status}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!quadraAtualizada) return res.status(404).json({ message: "Quadra nao encontrada." });
    return res.status(200).json(quadraAtualizada);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
