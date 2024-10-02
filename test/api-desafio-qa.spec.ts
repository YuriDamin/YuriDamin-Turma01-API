const pactum = require('pactum');
const { StatusCodes } = require('http-status-codes');
const faker = require('@faker-js/faker');

const baseUrl = 'https://api-desafio-qa.onrender.com'; // Base URL da API

describe('POST /companies', () => {
  it('deve criar uma nova empresa', async () => {
    await pactum
      .spec()
      .post(`${baseUrl}/companies`) // Endpoint para criar empresa
      .withJson({
        name: faker.company.companyName(), // Gera dinamicamente o nome da empresa
        cnpj: faker.string.numeric(14), // Gera um CNPJ fictício de 14 dígitos
        state: faker.address.stateAbbr(), // Estado gerado dinamicamente
        city: faker.address.city(), // Cidade gerada dinamicamente
        address: faker.address.streetAddress(), // Endereço gerado dinamicamente
        sector: faker.commerce.department() // Setor gerado dinamicamente
      })
      .expectStatus(StatusCodes.CREATED) // Valida se o status é 201 (Created)
      .expectJsonLike({
        message: 'Empresa criada com sucesso',
        company: {
          id: /\d+/, // Valida que o ID retornado é um número
          name: /.*/, // Valida que o nome é uma string
          cnpj: /\d{14}/, // Valida o formato do CNPJ
          state: /.*/,
          city: /.*/,
          address: /.*/,
          sector: /.*/
        }
      });
  });
});
