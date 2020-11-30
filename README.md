# aws-lambda-iamport-mobile-redirect

🎉 This is a nodejs project to handle iammport mobile redirection with aws lambda.

## Installation

```
$ yarn install
```

## The gist

```js
const getToken = await axios({
  url: 'https://api.iamport.kr/users/getToken',
  method: 'post', // POST method
  headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
  data: {
    imp_key: '[REST_API_KEY]', // REST API키
    imp_secret: '[REST_API_SECRET]', // REST API Secret
  },
});
```

In the index.js file, enter [REST_API_KEY] and [REST_API_SECRET] above according to your environment.

```js
    const order = await axios({
      url:
        //'https://[app_id].appsync-api.ap-northeast-2.amazonaws.com/graphql',
        '[graphql_url]',
      method: 'post',
      headers: {
        'x-api-key': '[x_api_key]',
      },
```

In the index.js file, enter [graphql_url] and [x_api_key] above according to your environment.

```js
callback(null, {
  statusCode: 302,
  headers: {
    Location: 'https://[url]?[stringQuery]',
  },
  body: null,
});
```

In the index.js file, enter [url] and [stringQuery] above according to your environment.
