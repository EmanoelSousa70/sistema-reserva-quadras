# Sistema de Reserva de Quadras

Aplicacao academica com front-end em HTML/CSS/JavaScript, manipulacao de DOM, API em Next.js e banco PostgreSQL hospedado no Neon.

## Tecnologias

- Front-end: HTML, CSS, JavaScript e DOM.
- API/back-end: Next.js API Routes.
- Banco de dados: PostgreSQL no Neon.
- Hospedagem sugerida: Vercel.

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
npm run dev
```

4. Abra no navegador:

```text
http://localhost:3000
```

As tabelas `quadras` e `reservas` sao criadas automaticamente no banco Neon na primeira chamada da API.

## Como hospedar

1. Crie um banco gratuito no Neon.
2. Copie a connection string do Neon.
3. Envie o projeto para um repositorio no GitHub.
4. Importe o repositorio na Vercel.
5. Em `Settings > Environment Variables`, cadastre:

```text
DATABASE_URL=sua_url_do_neon
```

6. Faca o deploy.

## Requisitos atendidos

- Duas entidades relacionadas 1:N: `quadras` e `reservas`.
- Validacoes no cliente e no servidor.
- Regra de negocio no servidor: uma quadra nao pode ter duas reservas confirmadas com horarios sobrepostos.
- Reserva com nome e CPF do cliente.
- Metodos HTTP: GET, POST, PUT, PATCH e DELETE.
- Ordenacao no servidor.
- Uso de `localStorage` para tema, ultima quadra selecionada e ultima ordenacao.
- Persistencia em banco PostgreSQL/Neon.
- Preparado para hospedagem gratuita na Vercel.

## Tratamento de erros

- `400`: dados obrigatorios ou formato invalido.
- `404`: quadra ou reserva nao encontrada.
- `405`: metodo HTTP nao permitido.
- `409`: conflito de horario na reserva.
- `500`: erro interno do servidor.

## Roteiro sugerido para o video

1. Apresentar a ideia do sistema e os integrantes.
2. Mostrar as duas entidades e o relacionamento 1:N.
3. Demonstrar cadastro, edicao, listagem e remocao de quadras.
4. Demonstrar criacao, edicao, cancelamento e listagem de reservas.
5. Mostrar as validacoes do formulario.
6. Tentar cadastrar duas reservas no mesmo horario para provar a regra do servidor.
7. Mostrar a ordenacao e o uso do localStorage.
8. Mostrar a variavel `DATABASE_URL` e explicar que os dados ficam no Neon.
9. Mostrar o deploy na Vercel.
