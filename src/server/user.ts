import 'server-only';

import { User } from '../types/global';

const USERS = process.env.USERS ?? '';

const parseUsers = (): User[] =>
  USERS.split(',').map((str) => {
    const [passphrase, calendarKey, heading] = str.split(':');
    return {
      passphrase,
      calendarKey,
      heading,
    };
  });

export const getUser = (passphrase: string | string[]): User | null => {
  if (typeof passphrase !== 'string') {
    return null;
  }

  return parseUsers().find((u) => u.passphrase === passphrase) || null;
};

export const getCalendarKeyOrThrow = (passphrase: string): string => {
  const user = getUser(passphrase);

  if (!user) {
    throw new Error('User not found');
  }

  return user.calendarKey;
};
