import { banco, garantirEstrutura } from "../../../lib/db";
import { enviarErrosValidacao, validarQuadra } from "../../../lib/validation";

export default async function handler(req, res) {
  try {
    await garantirEstrutura();
    const db = banco();

    if (req.method === "GET") {
      const ordenacoesPermitidas = {
        nome: "q.nome ASC",
        tipo: "q.tipo ASC",
        status: "q.status ASC",
        reservas: "total_reservas DESC"
      };
      const ordenacao = ordenacoesPermitidas[req.query.ordenar] || ordenacoesPermitidas.nome;

      const quadras = await db(`
        SELECT q.*, COUNT(r.id)::int AS total_reservas
        FROM quadras q
        LEFT JOIN reservas r ON r.quadra_id = q.id AND r.status = 'confirmada'
        GROUP BY q.id
        ORDER BY ${ordenacao}
      `);

      return res.status(200).json(quadras);
    }

    if (req.method === "POST") {
      const erros = validarQuadra(req.body);
      if (erros.length) return enviarErrosValidacao(res, erros);

      const [quadraCriada] = await db`
        INSERT INTO quadras (nome, tipo, localizacao, status)
        VALUES (${req.body.nome.trim()}, ${req.body.tipo.trim()}, ${req.body.localizacao.trim()}, ${req.body.status})
        RETURNING *
      `;

      return res.status(201).json(quadraCriada);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Metodo nao permitido." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
