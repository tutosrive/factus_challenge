import axios from 'axios';

export const validate_fact = async (req, res) => {
  const body = {
    numbering_range_id: 8, // Se consume del endpoint es de rango de numeracion
    reference_code: '12345931AT', // referencia de la venta
    observation: 'Aún estarán en live? en tiktok?',
    payment_method_code: 10, // metodo de pago se consume por tabla, en documentacion
    customer: {
      identification: '123456789',
      dv: 3, // Digito de verificacion. se envia si es nit
      company: '',
      trade_name: '',
      names: 'Tutos Sirve*',
      address: 'calle 1 # 2-68',
      email: 'tutosirve@enigmasas.com',
      phone: '1234567890',
      legal_organization_id: 2, //TIpo de organizacion, persona natural o juridica. se consume de tabla
      tribute_id: 21, // Si aplica o no aplica iva. se consume de tabla
      identification_document_id: 3, // Tipo de identificacion se consume de tabla
      municipality_id: 980, // municipio del cliente, se consume del endpoint municipios
    },
    items: [
      {
        code_reference: '12345',
        name: 'Factus versión PRO',
        quantity: 1, //requerido
        discount_rate: 20, // valor del porcentatje de descuento
        price: 5000000,
        tax_rate: '19.00', // valor del descuento aplicado
        unit_measure_id: 70, // se consume del endpoint unidad de medida
        standard_code_id: 1, // codigo para productos o serviciois se consume de tabla
        is_excluded: 0, // excluido de iva o no
        tribute_id: 1, // Tributto aplicado, se consume de endpoint tributo productos
        withholding_taxes: [
          // array de las tasas de retencion se cosume del endpoint tribuos
          {
            code: '06',
            withholding_tax_rate: '7.00',
          },
          {
            code: '05',
            withholding_tax_rate: '15.00',
          },
        ],
      },
      {
        code_reference: '12345',
        name: 'producto de prueba 2',
        quantity: 1, // requerido
        discount: 0, //requerido, si no tiene descuento debe ir en 0
        discount_rate: 0,
        price: 50000,
        tax_rate: '5.00',
        unit_measure_id: 70, // requerido por defecto 70
        standard_code_id: 1,
        is_excluded: 0,
        tribute_id: 1,
        withholding_taxes: [],
      },
    ],
  };

  const token = process.env.access_token;

  const config = {
    url: `${process.env.url_api}/v1/bills/validate`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    data: body,
  };

  console.log(config);
  //   axios
  //     .request(config)
  //     .then((res) => {
  //       console.log(res.data);
  //     })
  //     .catch((e) => {
  //       console.log(e);
  //     });
};
