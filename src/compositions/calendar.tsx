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
};
export const Calendar = (props: Props) => {
  const [events, setEvents] = useState<Event[]>(props.events);
  const [loading, setLoading] = useState(false);
  const [passphrase] = useLocalStorage({ key: 'passphrase' });

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
      const { id } = await res.json();
      console.log(id);

      setEvents((events) => [
        ...events,
        {
          id: id || 'NO_ID',
          date: dateStr,
          end: date.add(1, 'day').format('YYYY-MM-DD'),
          title,
        },
      ]);
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
        const res = await fetch(`/api/event/${id}`, {
          method: 'PUT',
          headers: { passphrase },
          body: JSON.stringify({ id, title }),
        });
        if (!res.ok) {
          throw new Error('failed to change title');
        }
        setEvents((events) => events.map((e) => (e.id === id ? { ...e, title } : e)));
      } else {
        const res = await fetch(`/api/event/${id}`, {
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
