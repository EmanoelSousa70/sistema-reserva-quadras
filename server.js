const fs = require("fs");
const path = require("path");
const express = require("express");
const { neon } = require("@neondatabase/serverless");

carregarVariaveisAmbiente();

const app = express();
const porta = process.env.PORT || 3000;
const statusValidosQuadra = ["ativa", "inativa"];
let clienteSql;
let estruturaPronta = false;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function carregarVariaveisAmbiente() {
  const caminhoEnv = path.join(__dirname, ".env");
  if (!fs.existsSync(caminhoEnv)) return;

  const linhas = fs.readFileSync(caminhoEnv, "utf8").split(/\r?\n/);
  linhas.forEach((linha) => {
    const conteudo = linha.trim();
    if (!conteudo || conteudo.startsWith("#")) return;

    const separador = conteudo.indexOf("=");
    if (separador === -1) return;

    const chave = conteudo.slice(0, separador).trim();
    const valor = conteudo.slice(separador + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[chave]) process.env[chave] = valor;
  });
}

function banco() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao configurada.");
  }

  if (!clienteSql) {
    clienteSql = neon(process.env.DATABASE_URL);
  }

  return clienteSql;
}

async function garantirEstrutura() {
  if (estruturaPronta) return;

  const db = banco();

  await db`
    CREATE TABLE IF NOT EXISTS quadras (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      localizacao TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('ativa', 'inativa')),
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS reservas (
      id SERIAL PRIMARY KEY,
      nome_cliente TEXT NOT NULL,
      cpf_cliente TEXT,
      data_reserva DATE NOT NULL,
      hora_inicio TIME NOT NULL,
      hora_fim TIME NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('confirmada', 'cancelada')) DEFAULT 'confirmada',
      quadra_id INTEGER NOT NULL REFERENCES quadras(id) ON DELETE CASCADE,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`ALTER TABLE reservas ADD COLUMN IF NOT EXISTS cpf_cliente TEXT`;

  const [contador] = await db`SELECT COUNT(*)::int AS total FROM quadras`;

  if (contador.total === 0) {
    await db`
      INSERT INTO quadras (nome, tipo, localizacao, status)
      VALUES
        ('Quadra Arena 1', 'Futebol', 'Bloco A', 'ativa'),
        ('Quadra Sol', 'Volei', 'Bloco B', 'ativa'),
        ('Quadra Cesta', 'Basquete', 'Bloco C', 'inativa')
    `;
  }

  estruturaPronta = true;
}

function estaVazio(valor) {
  return typeof valor !== "string" || valor.trim() === "";
}

function ehData(valor) {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor);
}

function ehHorario(valor) {
  return /^\d{2}:\d{2}$/.test(valor);
}

function dataHoje() {
  return new Date().toISOString().slice(0, 10);
}

function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function validarQuadra(dados) {
  const erros = [];

  if (estaVazio(dados.nome)) erros.push("Nome da quadra e obrigatorio.");
  if (estaVazio(dados.tipo)) erros.push("Tipo da quadra e obrigatorio.");
  if (estaVazio(dados.localizacao)) erros.push("Localizacao e obrigatoria.");
  if (!statusValidosQuadra.includes(dados.status)) erros.push("Status da quadra invalido.");

  return erros;
}

function validarReserva(dados) {
  const erros = [];
  const cpf = somenteNumeros(dados.cpf_cliente);

  if (estaVazio(dados.nome_cliente)) erros.push("Nome do cliente e obrigatorio.");
  if (cpf.length !== 11) erros.push("CPF do cliente deve ter 11 numeros.");
  if (!ehData(dados.data_reserva)) erros.push("Data da reserva e obrigatoria.");
  if (!ehHorario(dados.hora_inicio)) erros.push("Horario de inicio e obrigatorio.");
  if (!ehHorario(dados.hora_fim)) erros.push("Horario de termino e obrigatorio.");
  if (!Number.isInteger(Number(dados.quadra_id))) erros.push("Quadra e obrigatoria.");

  if (ehData(dados.data_reserva) && dados.data_reserva < dataHoje()) {
    erros.push("Nao e permitido reservar datas passadas.");
  }

  if (ehHorario(dados.hora_inicio) && ehHorario(dados.hora_fim) && dados.hora_fim <= dados.hora_inicio) {
    erros.push("Horario final deve ser maior que o horario inicial.");
  }

  return erros;
}

function enviarErrosValidacao(res, erros) {
  return res.status(400).json({ message: "Dados invalidos.", errors: erros });
}

function normalizarReserva(reserva) {
  return {
    ...reserva,
    data_reserva: reserva.data_reserva instanceof Date
      ? reserva.data_reserva.toISOString().slice(0, 10)
      : String(reserva.data_reserva).slice(0, 10),
    hora_inicio: String(reserva.hora_inicio).slice(0, 5),
    hora_fim: String(reserva.hora_fim).slice(0, 5)
  };
}

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

app.get("/api/quadras", async (req, res, next) => {
  try {
    await garantirEstrutura();
    const db = banco();
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

    res.json(quadras);
  } catch (erro) {
    next(erro);
  }
});

app.get("/api/quadras/:id", async (req, res, next) => {
  try {
    await garantirEstrutura();
    const db = banco();
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return enviarErrosValidacao(res, ["ID da quadra invalido."]);

    const [quadra] = await db`SELECT * FROM quadras WHERE id = ${id}`;
    if (!quadra) return res.status(404).json({ message: "Quadra nao encontrada." });

    res.json(quadra);
  } catch (erro) {
    next(erro);
  }
});

app.post("/api/quadras", async (req, res, next) => {
  try {
    await garantirEstrutura();
    const erros = validarQuadra(req.body);
    if (erros.length) return enviarErrosValidacao(res, erros);

    const db = banco();
    const [quadraCriada] = await db`
      INSERT INTO quadras (nome, tipo, localizacao, status)
      VALUES (${req.body.nome.trim()}, ${req.body.tipo.trim()}, ${req.body.localizacao.trim()}, ${req.body.status})
      RETURNING *
    `;

    res.status(201).json(quadraCriada);
  } catch (erro) {
    next(erro);
  }
});

app.put("/api/quadras/:id", async (req, res, next) => {
  try {
    await garantirEstrutura();
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return enviarErrosValidacao(res, ["ID da quadra invalido."]);

    const erros = validarQuadra(req.body);
    if (erros.length) return enviarErrosValidacao(res, erros);

    const db = banco();
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
    res.json(quadraAtualizada);
  } catch (erro) {
    next(erro);
  }
});

app.patch("/api/quadras/:id/status", async (req, res, next) => {
  try {
    await garantirEstrutura();
    const id = Number(req.params.id);
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
    res.json(quadraAtualizada);
  } catch (erro) {
    next(erro);
  }
});

app.delete("/api/quadras/:id", async (req, res, next) => {
  try {
    await garantirEstrutura();
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return enviarErrosValidacao(res, ["ID da quadra invalido."]);

    const db = banco();
    const quadraRemovida = await db`DELETE FROM quadras WHERE id = ${id} RETURNING id`;
    if (!quadraRemovida.length) return res.status(404).json({ message: "Quadra nao encontrada." });

    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
});

app.get("/api/reservas", async (req, res, next) => {
  try {
    await garantirEstrutura();
    const db = banco();
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

    res.json(reservas.map(normalizarReserva));
  } catch (erro) {
    next(erro);
  }
});

app.post("/api/reservas", async (req, res, next) => {
  try {
    await garantirEstrutura();
    const erros = validarReserva(req.body);
    if (erros.length) return enviarErrosValidacao(res, erros);

    const db = banco();
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

    res.status(201).json(normalizarReserva(reservaCriada));
  } catch (erro) {
    next(erro);
  }
});

app.put("/api/reservas/:id", async (req, res, next) => {
  try {
    await garantirEstrutura();
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return enviarErrosValidacao(res, ["ID da reserva invalido."]);

    const erros = validarReserva(req.body);
    if (erros.length) return enviarErrosValidacao(res, erros);

    const db = banco();
    const [reservaExistente] = await db`SELECT * FROM reservas WHERE id = ${id}`;
    if (!reservaExistente) return res.status(404).json({ message: "Reserva nao encontrada." });

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

    res.json(normalizarReserva(reservaAtualizada));
  } catch (erro) {
    next(erro);
  }
});

app.patch("/api/reservas/:id/cancelar", async (req, res, next) => {
  try {
    await garantirEstrutura();
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return enviarErrosValidacao(res, ["ID da reserva invalido."]);

    const db = banco();
    const [reservaAtualizada] = await db`
      UPDATE reservas
      SET status = 'cancelada'
      WHERE id = ${id}
      RETURNING *
    `;

    if (!reservaAtualizada) return res.status(404).json({ message: "Reserva nao encontrada." });
    res.json(normalizarReserva(reservaAtualizada));
  } catch (erro) {
    next(erro);
  }
});

app.delete("/api/reservas/:id", async (req, res, next) => {
  try {
    await garantirEstrutura();
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return enviarErrosValidacao(res, ["ID da reserva invalido."]);

    const db = banco();
    const reservaRemovida = await db`DELETE FROM reservas WHERE id = ${id} RETURNING id`;
    if (!reservaRemovida.length) return res.status(404).json({ message: "Reserva nao encontrada." });

    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
});

app.get("/api/disponibilidade", async (req, res, next) => {
  try {
    await garantirEstrutura();
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

    res.json(horarios);
  } catch (erro) {
    next(erro);
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ message: "Erro interno do servidor." });
});

app.listen(porta, () => {
  console.log(`Servidor Express rodando em http://localhost:${porta}`);
});
