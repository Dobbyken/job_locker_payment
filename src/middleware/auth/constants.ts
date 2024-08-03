export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'defaultSecret', // Use the JWT_SECRET from .env file or a default value
};
