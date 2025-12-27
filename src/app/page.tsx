'use client';

import { useLocalStorage } from '../hooks/use-local-storage';
import { Event } from '../types/global';
import { Calendar } from './calendar';
import { Login } from './login';

type Props = {
  events: Event[];
};

const Page = ({ events }: Props) => {
  const [passphrase, setPassphrase] = useLocalStorage({ key: 'passphrase' });
  const [heading, setHeading] = useLocalStorage({ key: 'heading' });

  return (
    <>
      <header>
        <h1>{heading || '🚣 🚣 🚣'}</h1>
        <div className="subtitle">kal.rhyyy.ch</div>
      </header>

      <main className={passphrase ? 'logged-in' : 'logged-out'}>
        {passphrase ? (
          <Calendar events={events} passphrase={passphrase} />
        ) : (
          <Login setPassphrase={setPassphrase} setHeading={setHeading} />
        )}
      </main>
    </>
  );
};

export default Page;
