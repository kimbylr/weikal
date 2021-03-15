import dayjs from 'dayjs';
import ical from 'ical';
import React from 'react';

import { Calendar } from '../compositions/calendar';
import { Login } from '../compositions/login';
import { useLocalStorage } from '../hooks/use-local-storage';
import { getCalendar } from '../services/cal-dav';
import { Event } from '../types/global';

type Props = {
  events: Event[];
};
const App = ({ events }: Props) => {
  const [passphrase, setPassphrase] = useLocalStorage({ key: 'passphrase' });

  return (
    <div>
      <header>
        <h1>{process.env.NEXT_PUBLIC_HEADING}</h1>
        <div className="subtitle">{process.env.NEXT_PUBLIC_SUBTITLE}</div>
      </header>
      <main className={passphrase ? 'logged-in' : 'logged-out'}>
        {passphrase ? (
          <Calendar events={events} />
        ) : (
          <Login setPassphrase={setPassphrase} />
        )}
      </main>
    </div>
  );
};

export const getServerSideProps = async () => {
  const calendar = await getCalendar();
  const events: Event[] = calendar.objects
    .map(({ calendarData }) => {
      const eventObj = ical.parseICS(calendarData);
      const id = Object.keys(eventObj)[0];

      if (eventObj[id].type !== 'VEVENT') {
        return null;
      }

      const { start, end, summary } = eventObj[id];
      return {
        date: dayjs(start).add(12, 'hours').format(`YYYY-MM-DD`),
        end: dayjs(end).add(12, 'hours').format(`YYYY-MM-DD`),
        title: summary,
        id,
      };
    })
    .filter(Boolean);

  return {
    props: { events },
  };
};

export default App;
