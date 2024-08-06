const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'KHRA API',
      description: 'API Documentation',
      version: '1.0.0',
      contact: {
        name: 'Developer',
      },
    },
    servers: [
      {
        url: 'https://api-xeniakhra.onrender.com',
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;
