import { banco, garantirEstrutura } from "../../../lib/db";
import { enviarErrosValidacao, validarQuadra } from "../../../lib/validation";

export default async function handler(req, res) {
  try {
    await garantirEstrutura();
    const db = banco();
    const id = Number(req.query.id);

    if (!Number.isInteger(id)) {
      return enviarErrosValidacao(res, ["ID da quadra invalido."]);
    }

    if (req.method === "GET") {
      const [quadra] = await db`SELECT * FROM quadras WHERE id = ${id}`;
      if (!quadra) return res.status(404).json({ message: "Quadra nao encontrada." });
      return res.status(200).json(quadra);
    }

    if (req.method === "PUT") {
      const erros = validarQuadra(req.body);
      if (erros.length) return enviarErrosValidacao(res, erros);

      const [quadraAtualizada] = await db`
        UPDATE quadras
        SET nome = ${req.body.nome.trim()},
            tipo = ${req.body.tipo.trim()},
            localizacao = ${req.body.localizacao.trim()},
            status = ${req.body.status}
        WHERE id = ${id}
        RETURNING *
      `;

      if (!quadraAtualizada) return res.status(404).json({ message: "Quadra nao encontrada." });
      return res.status(200).json(quadraAtualizada);
    }

    if (req.method === "DELETE") {
      const quadraRemovida = await db`DELETE FROM quadras WHERE id = ${id} RETURNING id`;
      if (!quadraRemovida.length) return res.status(404).json({ message: "Quadra nao encontrada." });
      return res.status(204).end();
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ message: "Metodo nao permitido." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
