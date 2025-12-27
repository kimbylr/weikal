const file = '../.auth'; // Ohai compiler, you don't know if this exists

import(file)
  .then((auth) => {
    console.log(
      auth.users
        .map(
          ({ passphrase, calendarKey, heading }) =>
            `${passphrase}:${calendarKey}:${heading}`,
        )
        .join(','),
    );
  })
  .catch(() => console.log('Need .auth.ts file at the project root.'));
