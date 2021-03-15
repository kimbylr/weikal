import React, { useState } from 'react';

type Props = {
  setPassphrase: (value: string) => void;
};
export const Login = ({ setPassphrase }: Props) => {
  const [input, setInput] = useState('');
  const [nope, setNope] = useState(false);

  return (
    <form
      className="login-form"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          const res = await fetch('/api/passphrase', {
            method: 'POST',
            body: JSON.stringify({ passphrase: input }),
          });
          if (res.ok) {
            setPassphrase(input);
          } else {
            setNope(true);
          }
        } catch (e) {
          console.error(e);
          setNope(true);
        }
      }}
    >
      <p>Wirf dein Wurfänkerchen!</p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        <button>Hopp!</button>
      </div>
      {nope && <p style={{ color: '#a10000' }}>Das war ein Schuss ins Wasser.</p>}
    </form>
  );
};
