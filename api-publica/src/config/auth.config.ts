export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
  jwtExpiration: process.env.JWT_EXPIRATION || '2h',
}