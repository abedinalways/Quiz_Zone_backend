export default () => ({
  port: parseInt(process.env.PORT || '5000'),
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_xxxxxxxxxxxxx',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_xxxxxxxxxxxxx',
  },
  freeQuizzes: parseInt(process.env.FREE_QUIZZES_LIMIT || '50'),
});
