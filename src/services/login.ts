'use server';

import { getUser } from '../server/user';

const login = async (passphrase: string) => {
  const user = getUser(passphrase);
  if (user) {
    console.log('Login succeeded');
    return user;
  } else {
    console.log('Login failed, passphrase:', passphrase);
    return null;
  }
};

export default login;
