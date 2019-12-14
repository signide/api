declare namespace NodeJS {
  interface ProcessEnv {
    API_PORT: string;
    API_IN_PRODUCTION: string;
    JWT_SECRET: string;
    JWT_EXPIRE_TIME: string;
    KEYS_WEATHER: string;
    TYPEORM_CONNECTION: string;
    TYPEORM_HOST: string;
    TYPEORM_USERNAME: string;
    TYPEORM_PASSWORD: string;
    TYPEORM_DATABASE: string;
    TYPEORM_PORT: string;
    TYPEORM_SYNCHRONIZE: string;
    TYPEORM_LOGGING: string;
    TYPEORM_ENTITIES: string;
    TEST_DATABASE: string;
  }
}
