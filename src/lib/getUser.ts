import type { UserDto } from '../dto/UserDto';

export const getUser = (req: Request & { user?: UserDto }) => {
  if (!req.user) {
    throw new Error('User not found.');
  }
  return req.user;
};
