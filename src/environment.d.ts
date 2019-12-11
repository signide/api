declare namespace NodeJS {
  interface ProcessEnv {
    API_PORT: number;
    API_IN_PRODUCTION: boolean;
    JWT_SECRET: string;
    JWT_EXPIRE_TIME: string | number;
    KEYS_WEATHER: string;
    TYPEORM_CONNECTION: string;
    TYPEORM_HOST: string;
    TYPEORM_USERNAME: string;
    TYPEORM_PASSWORD: string;
    TYPEORM_DATABASE: string;
    TYPEORM_PORT: number;
    TYPEORM_SYNCHRONIZE: boolean;
    TYPEORM_LOGGING: boolean;
    TYPEORM_ENTITIES: string;
    TEST_DATABASE: string;
  }
}
