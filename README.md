# Sistema de Reserva de Quadras

Aplicacao academica com front-end em HTML, CSS, JavaScript e manipulacao de DOM, back-end em Express.js e banco PostgreSQL hospedado no Neon.

Alunos : Emanoel Sousa, Paulo do Carmo , Osvaldo Cavalcante .
## LINK VIDEO : https://youtu.be/8K3LIKgNVqU
## link hospedagem : https://sistema-reserva-quadras.onrender.com/
## Tecnologias

- Front-end: HTML, CSS, JavaScript e DOM.
- Back-end: Node.js com Express.js.
- Banco de dados: PostgreSQL no Neon.
- Hospedagem sugerida para Express: Render ou Railway.

## Como executar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` usando o modelo `.env.example`:

```text
DATABASE_URL="sua_url_do_neon"
```

3. Rode o projeto:

```bash
npm start
```

Ou, para desenvolvimento:

```bash
npm run dev
```

4. Abra no navegador:

```text
http://localhost:3000
```

As tabelas `quadras` e `reservas` sao criadas automaticamente no banco Neon na primeira chamada da API.

## Requisitos atendidos

- Duas entidades relacionadas 1:N: `quadras` e `reservas`.
- Validacoes no cliente e no servidor.
- Regra de negocio no servidor: uma quadra nao pode ter duas reservas confirmadas com horarios sobrepostos.
- Reserva com nome e CPF do cliente.
- Metodos HTTP: GET, POST, PUT, PATCH e DELETE.
- Ordenacao no servidor.
- Uso de `localStorage` para tema, ultima quadra selecionada e ultima ordenacao.
- Persistencia em banco PostgreSQL/Neon.
- Back-end feito com Express.js.

## Tratamento de erros

- `400`: dados obrigatorios ou formato invalido.
- `404`: quadra ou reserva nao encontrada.
- `409`: conflito de horario na reserva.
- `500`: erro interno do servidor.

## Hospedagem no Render

1. Envie o projeto para o GitHub.
2. Acesse Render e crie um novo `Web Service`.
3. Conecte o repositorio do GitHub.
4. Configure:

```text
Build Command: npm install
Start Command: npm start
```

5. Em `Environment`, adicione:

```text
DATABASE_URL=sua_url_real_do_neon
```

6. Faca o deploy.
