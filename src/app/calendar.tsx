import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Spinner } from '../elements/spinner';
import { changeEvent, createEvent, deleteEvent, getEvents } from '../services/calendar';
import { Event } from '../types/global';
import { WEEKDAYS } from '../util/weekdays';

const FAILED_ALERT =
  'Das hat leider nicht funktioniert :( Profitipp: Einfach nochmal versuchen. Sonst kim@rhyyy.ch fragen.';

type Props = {
  events: Event[];
  passphrase: string;
};

export const Calendar = ({ passphrase }: Props) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  console.log(events);

  useEffect(() => {
    getEvents(passphrase)
      .then((data) => setEvents(data))
      .catch(() => alert('Einträge konnten nicht geladen werden. '));
  }, []);

  const addEvent = async (dateStr: string) => {
    const date = dayjs(dateStr);
    const weekday = WEEKDAYS[date.day()];
    const title = prompt(`Neuer Eintrag\n\n${weekday} ${date.format('D.M.')}`);
    if (!title) {
      return;
    }

    setLoading(true);
    try {
      const event = await createEvent({ passphrase, startDate: dateStr, title });
      if (!event) {
        throw new Error('No event');
      }
      setEvents((events) => [
        ...events,
        { ...event, title, date: dateStr, end: date.add(1, 'day').format('YYYY-MM-DD') },
      ]);
    } catch (e) {
      console.log(e);
      alert(FAILED_ALERT);
    } finally {
      setLoading(false);
    }
  };

  const editEvent = async (id: string) => {
    const event = events.find((event) => id === event.id);
    if (!event) {
      return;
    }

    const date = dayjs(event.date);
    const weekday = WEEKDAYS[date.day()];
    const formattedDate = date.format('D.M.');
    const title = prompt(
      `"${event.title}" am ${weekday} ${formattedDate}\n\nNeuer Titel? (Leer zum Löschen)`,
      event.title,
    );

    if (title === null /** cancelled by user */) {
      return;
    }

    setLoading(true);
    try {
      if (title) {
        if (!(await changeEvent({ passphrase, filename: event.filename, title }))) {
          throw new Error('failed to change title');
        }
        setEvents((events) => events.map((e) => (e.id === id ? { ...e, title } : e)));
      } else {
        if (!(await deleteEvent({ passphrase, filename: event.filename }))) {
          throw new Error('failed to delete');
        }
        setEvents((events) => events.filter((event) => event.id !== id));
      }
    } catch {
      alert(FAILED_ALERT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        firstDay={1}
        defaultAllDay
        events={events}
        dateClick={({ dateStr }) => addEvent(dateStr)}
        eventClick={({ event }) => editEvent(event.id)}
        eventContent={({ event }) => <div className="event-container">{event.title}</div>}
      />

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <Spinner />
          </div>
        </div>
      )}
    </div>
  );
};
