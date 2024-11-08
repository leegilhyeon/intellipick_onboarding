import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const swagger = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "회원가입 및 로그인",
      version: "1.0.0",
      description: "회원가입, 로그인, 토큰 발급 API",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./src/routers/*.js"],
};

const spec = swaggerJSDoc(swagger);

export { swaggerUi, spec };
