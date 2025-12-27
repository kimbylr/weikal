import { users } from '../.auth';

console.log(
  users
    .map(
      ({ passphrase, calendarKey, heading }) => `${passphrase}:${calendarKey}:${heading}`,
    )
    .join(','),
);
