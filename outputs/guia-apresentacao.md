# Guia de Apresentacao - Sistema de Reserva de Quadras

## Sequencia sugerida para o video

1. Apresente o tema: sistema para cadastrar quadras e reservar horarios.
2. Mostre as entidades: `Quadra` e `Reserva`, explicando o relacionamento 1:N.
3. Explique que o front-end usa HTML, CSS, JavaScript e DOM.
4. Explique que o back-end usa Express.js no arquivo `server.js`.
5. Demonstre o cadastro, edicao, ativacao/inativacao e remocao de quadras.
6. Demonstre o cadastro, edicao, cancelamento e remocao de reservas.
7. Mostre as validacoes no front-end: campos obrigatorios, CPF e horario final maior que inicial.
8. Mostre a regra do servidor: tente reservar a mesma quadra em horario sobreposto.
9. Mostre a ordenacao feita pelo servidor.
10. Mostre o uso do localStorage: tema, ultima quadra selecionada e ultima ordenacao.
11. Explique que os dados ficam persistidos no PostgreSQL do Neon.

## Frase curta para explicar a regra principal

O sistema nao permite duas reservas confirmadas para a mesma quadra quando os horarios se cruzam. Essa validacao fica no servidor porque e uma regra de negocio critica e nao pode depender apenas do navegador.

## Tratamento de erros

- `400`: dados invalidos ou campos obrigatorios ausentes.
- `404`: quadra ou reserva nao encontrada.
- `409`: conflito de horario na reserva.
- `500`: erro interno do servidor.

## Checklist da rubrica

- Entidades 1:N: uma Quadra possui varias Reservas.
- Validacao no cliente e no servidor.
- Regra exclusiva do servidor: conflito de horario.
- Metodos HTTP: GET, POST, PUT, PATCH e DELETE.
- Ordenacao no servidor.
- localStorage no navegador.
- Banco PostgreSQL no Neon.
- Back-end com Express.js.
- Video explicativo com no maximo 10 minutos.
