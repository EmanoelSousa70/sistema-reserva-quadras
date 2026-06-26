# Guia de Apresentacao - Sistema de Reserva de Quadras

## Sequencia sugerida para o video

1. Apresente o tema: sistema para cadastrar quadras e reservar horarios.
2. Mostre as entidades: `Quadra` e `Reserva`, explicando o relacionamento 1:N.
3. Demonstre o cadastro, edicao, ativacao/inativacao e remocao de quadras.
4. Demonstre o cadastro, edicao, cancelamento e remocao de reservas.
5. Mostre as validacoes no front-end: campos obrigatorios, CPF e horario final maior que inicial.
6. Mostre a regra do servidor: tente reservar a mesma quadra em horario sobreposto.
7. Mostre a ordenacao feita pelo servidor.
8. Mostre o uso do localStorage: tema, ultima quadra selecionada e ultima ordenacao.
9. Explique que os dados ficam persistidos no PostgreSQL do Neon.
10. Mostre o deploy na Vercel e a variavel de ambiente `DATABASE_URL`.

## Frase curta para explicar a regra principal

O sistema nao permite duas reservas confirmadas para a mesma quadra quando os horarios se cruzam. Essa validacao fica no servidor porque e uma regra de negocio critica e nao pode depender apenas do navegador.

## Tratamento de erros

- `400`: dados invalidos ou campos obrigatorios ausentes.
- `404`: quadra ou reserva nao encontrada.
- `405`: metodo HTTP nao permitido.
- `409`: conflito de horario na reserva.
- `500`: erro interno do servidor.

## Checklist da rubrica

- Entidades 1:N: uma Quadra possui varias Reservas.
- Validacao no cliente e no servidor.
- Regra exclusiva do servidor: conflito de horario.
- Reserva com nome e CPF do cliente.
- Metodos HTTP: GET, POST, PUT, PATCH e DELETE.
- Ordenacao no servidor.
- localStorage no navegador.
- Banco PostgreSQL no Neon.
- Hospedagem na Vercel.
- Video explicativo com no maximo 10 minutos.
