# Guia de Estudo - Sistema de Reserva de Quadras

## Resumo do projeto

O projeto e um sistema de reserva de quadras esportivas. Ele permite cadastrar quadras, cadastrar reservas, listar os dados, editar, cancelar/remover e verificar horarios disponiveis.

O sistema usa:

- Front-end: HTML, CSS, JavaScript e manipulacao de DOM.
- Back-end: Node.js com Express.js.
- Banco de dados: PostgreSQL no Neon.

## Onde esta cada parte

### Front-end

- HTML: `public/index.html`
- JavaScript com DOM: `public/app.js`
- Estilos CSS: `public/styles.css`

No `public/app.js` ficam:

- captura dos campos pelo DOM;
- eventos de clique e envio de formulario;
- validacoes no cliente;
- chamadas `fetch` para a API;
- uso de `localStorage`;
- renderizacao das listas de quadras, reservas e horarios.

### Back-end com Express

- Servidor principal: `server.js`

No `server.js` ficam:

- configuracao do Express;
- rotas HTTP;
- validacoes no servidor;
- regra de conflito de horario;
- conexao com o banco Neon;
- criacao das tabelas;
- tratamento de erros.

### Banco de dados

O banco usado e PostgreSQL no Neon.

As tabelas principais sao:

- `quadras`
- `reservas`

Relacionamento:

- uma quadra pode ter varias reservas;
- uma reserva pertence a uma quadra;
- isso forma relacionamento 1:N.

## Requisitos da atividade

### 1. Duas entidades relacionadas 1:N

Entidades:

- Quadra
- Reserva

Relacionamento:

- uma quadra pode ter varias reservas;
- uma reserva pertence a apenas uma quadra.

Onde aparece:

- banco e rotas: `server.js`
- front-end: `public/index.html` e `public/app.js`

### 2. Validacoes no cliente e no servidor

No cliente:

- `public/app.js`
- funcoes `validarFormularioQuadra` e `validarFormularioReserva`

No servidor:

- `server.js`
- funcoes `validarQuadra` e `validarReserva`

Regra apenas no servidor:

- nao permitir reserva com horario sobreposto na mesma quadra e na mesma data.

Onde esta:

- `server.js`
- funcao `existeConflitoReserva`

### 3. Metodos HTTP

GET:

- listar quadras;
- listar reservas;
- consultar disponibilidade.

POST:

- criar quadra;
- criar reserva.

PUT:

- editar quadra;
- editar reserva.

PATCH:

- ativar/inativar quadra;
- cancelar reserva.

DELETE:

- remover quadra;
- remover reserva.

### 4. Ordenacao no servidor

Quadras podem ser ordenadas por:

- nome;
- tipo;
- status;
- quantidade de reservas.

Reservas podem ser ordenadas por:

- data e horario;
- cliente;
- quadra.

Onde esta:

- `server.js`
- rotas `GET /api/quadras` e `GET /api/reservas`

### 5. LocalStorage

O sistema usa `localStorage` para salvar:

- tema claro/escuro;
- ultima quadra selecionada;
- ultima ordenacao escolhida.

Onde esta:

- `public/app.js`

### 6. Persistencia em banco de dados

O banco usado e PostgreSQL no Neon.

Onde esta:

- `server.js`
- variavel `DATABASE_URL`

## Perguntas provaveis e respostas

### Quais sao as entidades?

As entidades sao Quadra e Reserva. Uma quadra pode ter varias reservas, por isso o relacionamento e 1:N.

### Qual e a regra de negocio principal?

A regra principal e nao permitir que duas reservas confirmadas ocupem a mesma quadra em horarios sobrepostos.

### Como o sistema verifica conflito de horario?

O servidor verifica se ja existe reserva confirmada na mesma quadra e data onde:

```sql
hora_inicio < nova_hora_fim
AND hora_fim > nova_hora_inicio
```

Se existir, retorna erro `409`, indicando conflito.

### Por que essa regra fica no servidor?

Porque regra de negocio importante nao pode depender apenas do navegador. O usuario poderia burlar o front-end, mas nao consegue burlar a validacao do servidor.

### Onde entra o DOM?

O DOM e usado no `public/app.js` para capturar formularios, ouvir eventos, preencher listas, mostrar mensagens e atualizar visualmente os horarios livres/ocupados.

### Onde entra o Express.js?

O Express.js fica no `server.js`. Ele cria o servidor, recebe as requisicoes HTTP, valida os dados, aplica as regras de negocio e conversa com o banco de dados.

### Onde entra o localStorage?

Ele salva preferencias do usuario, como tema, ultima quadra selecionada e ultima ordenacao usada.

### Onde esta a persistencia?

Os dados ficam no banco PostgreSQL hospedado no Neon. A aplicacao usa a variavel `DATABASE_URL` para conectar ao banco.

## Ordem sugerida para apresentar

1. Mostrar a tela inicial.
2. Explicar as entidades Quadra e Reserva.
3. Cadastrar uma quadra.
4. Cadastrar uma reserva.
5. Mostrar a lista de reservas.
6. Tentar cadastrar reserva no mesmo horario para mostrar o erro.
7. Mostrar ordenacao.
8. Trocar tema para mostrar localStorage.
9. Mostrar rapidamente o banco Neon.
10. Mostrar o deploy.
