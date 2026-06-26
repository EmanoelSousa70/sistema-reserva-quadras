import { neon } from "@neondatabase/serverless";

let clienteSql;
let estruturaPronta = false;

export function banco() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao configurada. Crie um banco no Neon e cadastre a variavel no .env ou na Vercel.");
  }

  if (!clienteSql) {
    clienteSql = neon(process.env.DATABASE_URL);
  }

  return clienteSql;
}

export async function garantirEstrutura() {
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

export function normalizarReserva(reserva) {
  return {
    ...reserva,
    data_reserva: reserva.data_reserva instanceof Date
      ? reserva.data_reserva.toISOString().slice(0, 10)
      : String(reserva.data_reserva).slice(0, 10),
    hora_inicio: String(reserva.hora_inicio).slice(0, 5),
    hora_fim: String(reserva.hora_fim).slice(0, 5)
  };
}
