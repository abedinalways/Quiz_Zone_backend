declare const _default: () => {
    port: number;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
    };
    freeQuizzes: number;
};
export default _default;
