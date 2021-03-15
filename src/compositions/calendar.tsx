import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import { WEEKDAYS } from '../helpers/weekdays';
import { Event } from '../types/global';
import { Spinner } from '../elements/spinner';
import { useLocalStorage } from '../hooks/use-local-storage';

type Props = {
  events: Event[];
  passphrase: string;
};
export const Calendar = ({ events: initialEvents, passphrase }: Props) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState(false);

  const createEvent = async (dateStr: string) => {
    const date = dayjs(dateStr);
    const weekday = WEEKDAYS[date.day()];
    const title = prompt(`Neuer Eintrag\n\n${weekday} ${date.format('D.M.')}`);
    if (!title) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/event', {
        method: 'POST',
        headers: { passphrase },
        body: JSON.stringify({ startDate: dateStr, title }),
      });
      const { id, filename } = await res.json();

      setEvents((events) => [
        ...events,
        {
          id,
          filename,
          title,
          date: dateStr,
          end: date.add(1, 'day').format('YYYY-MM-DD'),
        },
      ]);
    } catch {
      alert('Sorry, hat nicht funktioniert. Seite neu laden und nochmals probieren!');
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
        const res = await fetch(`/api/event/${event.filename}`, {
          method: 'PUT',
          headers: { passphrase },
          body: JSON.stringify({ id, title }),
        });
        if (!res.ok) {
          throw new Error('failed to change title');
        }
        setEvents((events) => events.map((e) => (e.id === id ? { ...e, title } : e)));
      } else {
        const res = await fetch(`/api/event/${event.filename}`, {
          method: 'DELETE',
          headers: { passphrase },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) {
          throw new Error('failed to delete');
        }
        setEvents((events) => events.filter((event) => event.id !== id));
      }
    } catch {
      alert('Sorry, hat nicht funktioniert. Seite neu laden und nochmals probieren!');
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
        dateClick={({ dateStr }) => createEvent(dateStr)}
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
