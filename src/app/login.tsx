import { useEffect, useRef, useState } from 'react';
import login from '../services/login';

type Props = {
  setPassphrase: (value: string) => void;
  setHeading: (value: string) => void;
};

export const Login = ({ setPassphrase, setHeading }: Props) => {
  const [input, setInput] = useState('');
  const [nope, setNope] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current && ref.current.focus();
  }, []);

  return (
    <form
      className="login-form"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          const user = await login(input);
          if (user) {
            setPassphrase(user.passphrase);
            setHeading(user.heading);
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
          ref={ref}
          type="password"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          data-1p-ignore
        />
        <button>Hopp!</button>
      </div>
      {nope && <p style={{ color: '#a10000' }}>Das war ein Schuss ins Wasser.</p>}
    </form>
  );
};
