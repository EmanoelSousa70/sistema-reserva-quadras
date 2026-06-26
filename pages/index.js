import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Sistema de Reserva de Quadras</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>

      <header className="app-header">
        <div>
          <p className="eyebrow">Sistema academico de esportes</p>
          <h1>Reserva de Quadras</h1>
          <p className="header-copy">Controle de horarios, clientes e disponibilidade em um so lugar.</p>
        </div>
        <div className="court-mark" aria-hidden="true">
          <span className="court-line center"></span>
          <span className="court-line area-left"></span>
          <span className="court-line area-right"></span>
        </div>
        <button id="alternarTema" className="icon-button" type="button" title="Alternar tema">Tema</button>
      </header>

      <main className="layout">
        <section className="panel">
          <div className="section-title">
            <h2>Gerenciar quadras</h2>
            <select id="ordenacaoQuadras" title="Ordenar quadras">
              <option value="nome">Nome</option>
              <option value="tipo">Tipo</option>
              <option value="status">Status</option>
              <option value="reservas">Quantidade de reservas</option>
            </select>
          </div>

          <form id="formularioQuadra" className="form-grid">
            <input type="hidden" id="quadraId" />
            <label>Nome<input id="nomeQuadra" type="text" placeholder="Ex: Quadra Arena 1" required /></label>
            <label>Tipo<select id="tipoQuadra" required><option value="">Selecione</option><option value="Futebol">Futebol</option><option value="Volei">Volei</option><option value="Basquete">Basquete</option><option value="Tenis">Tenis</option></select></label>
            <label>Localizacao<input id="localizacaoQuadra" type="text" placeholder="Ex: Bloco A" required /></label>
            <label>Status<select id="statusQuadra" required><option value="ativa">Ativa</option><option value="inativa">Inativa</option></select></label>
            <div className="form-actions"><button type="submit">Salvar quadra</button><button id="limparFormularioQuadra" className="secondary" type="button">Limpar</button></div>
          </form>

          <div id="listaQuadras" className="item-list"></div>
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>Criar e gerenciar reservas</h2>
            <select id="ordenacaoReservas" title="Ordenar reservas"><option value="data">Data e horario</option><option value="cliente">Cliente</option><option value="quadra">Quadra</option></select>
          </div>

          <form id="formularioReserva" className="form-grid">
            <input type="hidden" id="reservaId" />
            <div id="modoReserva" className="form-mode">Nova reserva</div>
            <div id="mensagemFormulario" className="form-message" role="alert"></div>
            <label>Cliente<input id="nomeCliente" type="text" placeholder="Nome do cliente" required /></label>
            <label>CPF<input id="cpfCliente" type="text" placeholder="000.000.000-00" inputMode="numeric" maxLength="14" required /></label>
            <label>Quadra<select id="quadraReserva" required></select></label>
            <label>Data<input id="dataReserva" type="date" required /></label>
            <label>Inicio<input id="horarioInicio" type="time" required /></label>
            <label>Termino<input id="horarioFim" type="time" required /></label>
            <div className="form-actions"><button type="submit">Salvar reserva</button><button id="limparFormularioReserva" className="secondary" type="button">Limpar</button></div>
          </form>

          <div className="schedule-box">
            <div className="section-title compact-title">
              <h2>Horarios da quadra selecionada</h2>
              <button id="atualizarDisponibilidade" className="secondary" type="button">Atualizar</button>
            </div>
            <div id="quadroDisponibilidade" className="schedule-grid"></div>
          </div>

          <div id="listaReservas" className="item-list"></div>
        </section>
      </main>

      <div id="aviso" className="toast" role="status" aria-live="polite"></div>
      <script src="/app.js" defer></script>
    </>
  );
}
