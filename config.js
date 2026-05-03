// src/config.js
const config = {
  development: {
    API_BASE_URL: 'http://127.0.0.1:5000'
  },
  production: {
    API_BASE_URL: 'https://backend-linux-python-api-dffmh5hdbndrgmgy.centralus-01.azurewebsites.net'
  }
};

export default process.env.NODE_ENV === 'production' ? config.production : config.development;