import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('API de Empresas', () => {
  let token = '';
  let idEmpresa = '';
  const baseUrl = 'https://api-desafio-qa.onrender.com';
  const p = pactum;
  const rep = SimpleReporter;

  p.request.setDefaultTimeout(90000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Empresas', () => {
    it('Deve cadastrar uma nova empresa', async () => {
      idEmpresa = await p
        .spec()
        .post(`${baseUrl}/company`)
        .withHeaders('monitor', false)
        .withJson({
          name: faker.company.name(),
          cnpj: faker.string.numeric(14),
          state: faker.location.state(),
          city: faker.location.city(),
          address: faker.location.streetAddress(),
          sector: faker.commerce.department()
        })
        .expectStatus(StatusCodes.CREATED)
        .expectBodyContains('Cadastro de Empresa realizado com sucesso')
        .returns('_id');
    });

    it('Deve buscar a empresa cadastrada', async () => {
      await p
        .spec()
        .get(`${baseUrl}/company/${idEmpresa}`)
        .withHeaders('monitor', false)
        .expectStatus(StatusCodes.OK);
    });

    it('Deve falhar ao cadastrar empresa sem token', async () => {
      await p
        .spec()
        .post(`${baseUrl}/company`)
        .withHeaders('monitor', false)
        .withJson({
          name: faker.company.name(),
          cnpj: faker.string.numeric(14),
          state: faker.location.state(),
          city: faker.location.city(),
          address: faker.location.streetAddress(),
          sector: faker.commerce.department()
        })
        .expectStatus(StatusCodes.UNAUTHORIZED)
        .expectBodyContains(
          'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais'
        );
    });

    it('Validar empresas com CNPJ duplicado', async () => {
      const cnpjDuplicado = faker.string.numeric(14);

      await p
        .spec()
        .post(`${baseUrl}/company`)
        .withHeaders('Authorization', token)
        .withHeaders('monitor', false)
        .withJson({
          name: faker.company.name(),
          cnpj: cnpjDuplicado,
          state: faker.location.state(),
          city: faker.location.city(),
          address: faker.location.streetAddress(),
          sector: faker.commerce.department()
        })
        .expectStatus(StatusCodes.CREATED)
        .expectBodyContains('Cadastro realizado com sucesso');

      await p
        .spec()
        .post(`${baseUrl}/company`)
        .withHeaders('Authorization', token)
        .withHeaders('monitor', false)
        .withJson({
          name: faker.company.name(),
          cnpj: cnpjDuplicado,
          state: faker.location.state(),
          city: faker.location.city(),
          address: faker.location.streetAddress(),
          sector: faker.commerce.department()
        })
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectBodyContains('Já existe uma empresa com esse CNPJ');
    });
  });

  it('Deve buscar os funcionários por empresa', async () => {
    await p
      .spec()
      .get(`${baseUrl}/company/${idEmpresa}/employees`)
      .withHeaders('Authorization', `Bearer ${token}`)
      .withHeaders('monitor', false)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        employees: [
          {
            name: String,
            position: String,
            email: String
          }
        ]
      });
  });

  it('Deve adicionar um serviço para a empresa', async () => {
    await p
      .spec()
      .post(`${baseUrl}/company/${idEmpresa}/service`)
      .withHeaders('Authorization', `Bearer ${token}`)
      .withHeaders('monitor', false)
      .withJson({
        serviceName: faker.commerce.productName(),
        serviceDescription: faker.commerce.productDescription()
      })
      .expectStatus(StatusCodes.CREATED)
      .expectBodyContains('Serviço adicionado com sucesso');
  });

  afterAll(() => p.reporter.end());
});
