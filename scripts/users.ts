import('../.auth')
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
