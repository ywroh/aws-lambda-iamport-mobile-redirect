const axios = require('axios');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
  try {
    console.info('CheckoutMobile start');
    console.info(
      'CheckoutMobile event\n' + JSON.stringify(event, null, 2)
    );

    const params = {};

    console.log('CheckoutMobile dynamo params\n', params);

    //const { imp_uid, merchant_uid } = req.query; // req의 query에서 imp_uid, merchant_uid 추출
    const eventString = JSON.stringify(event, null, 2);
    const eventStringParse = JSON.parse(eventString);
    const imp_uid = eventStringParse.imp_uid;
    console.info('CheckoutMobile imp_uid\n' + imp_uid);
    const merchant_uid = eventStringParse.merchant_uid;
    console.info('CheckoutMobile merchant_uid\n ' + merchant_uid);

    // 액세스 토큰(access token) 발급 받기
    const getToken = await axios({
      url: 'https://api.iamport.kr/users/getToken',
      method: 'post', // POST method
      headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
      data: {
        imp_key: '[REST_API_KEY]', // REST API키
        imp_secret:
          '[REST_API_SECRET]', // REST API Secret
      },
    });
    const { access_token } = getToken.data.response; // 인증 토큰

    // imp_uid로 아임포트 서버에서 결제 정보 조회
    const getPaymentData = await axios({
      url: 'https://api.iamport.kr/payments/' + imp_uid, // imp_uid 전달
      method: 'get', // GET method
      headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
    });
    const paymentData = getPaymentData.data.response; // 조회한 결제 정보
    console.log('CheckoutMobile paymentData\n', paymentData);

    const paymentDataCustomParse = JSON.parse(paymentData.custom_data);
    params.TableName = '[Table_Name]';
    params.Item = {
      order_merchantUid: merchant_uid,
      order_buyerName: paymentData.buyer_name,
      order_buyerTel: paymentData.buyer_tel,
      order_buyerEmail: paymentData.buyer_email,
      order_shippingName: paymentDataCustomParse.order_shippingName,
      order_shippingTel: paymentDataCustomParse.order_shippingTel,
      order_shippingPostcode: paymentData.buyer_postcode,
      order_shippingAddr: paymentData.buyer_addr,
      order_shippingFee: paymentDataCustomParse.order_shippingFee,
      order_productInfos: paymentDataCustomParse.order_productInfos,
      order_amount: paymentData.amount,
      order_payMethod: paymentData.pay_method,
      order_pg: paymentData.pg_provider,
      order_site: paymentDataCustomParse.order_site,
      order_shippingMemo: paymentDataCustomParse.order_shippingMemo,
    };

    console.log('CheckoutMobile params.Item\n', params.Item);

    const order = await axios({
      url:
        //'https://[app_id].appsync-api.ap-northeast-2.amazonaws.com/graphql',
        '[graphql_url]',
      method: 'post',
      headers: {
        'x-api-key': '[api_key]',
      },
      data: {
        query: `
        mutation CreateOrder(
          $input: CreateOrderInput!
          $condition: ModelOrderConditionInput
        ) {
          createOrder(input: $input, condition: $condition) {
            id
            order_merchantUid
            order_invoice
            order_buyerName
            order_buyerTel
            order_buyerEmail
            order_shippingName
            order_shippingTel
            order_shippingPostcode
            order_shippingAddr
            order_shippingAddrDetail
            order_shippingAddrRef
            order_shippingMemo
            order_shippingFee
            order_productInfos {
              order_productName
              order_productOption
              order_productQuantity
              order_productPrice
            }
            order_amount
            order_payMethod
            order_pg
            order_site
            createdAt
            updatedAt
          }
        }
      `,
        variables: {
          input: params.Item,
        },
      },
    });

    console.log('CheckoutMobile order\n', order);

    callback(null, {
      statusCode: 302,
      headers: {
        Location:
          'https://[url]?[stringQuery]',
      },
      body: null,
    });
  } catch (e) {
    console.warn('CheckoutMobile e\n' + e);
  }
};