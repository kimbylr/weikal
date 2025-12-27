'use server';

import dayjs from 'dayjs';
import ical from 'ical';
import { Event } from '../types/global';
import { isTruthy } from '../util/is-truthy';
import * as calDav from '../server/cal-dav';

export const getEvents = async (calendarKey: string): Promise<Event[]> =>
  ((await calDav.getAllEvents(calendarKey)) || [])
    .map(({ calendarData, filename }) => {
      const eventObj = ical.parseICS(calendarData);
      const id = Object.keys(eventObj)[0];

      if (eventObj[id].type !== 'VEVENT') {
        return null;
      }

      const { start, end, summary } = eventObj[id];
      return {
        date: dayjs(start).add(12, 'hours').format(`YYYY-MM-DD`),
        end: dayjs(end).add(12, 'hours').format(`YYYY-MM-DD`),
        title: summary ?? '(no title)',
        filename,
        id,
      };
    })
    .filter(isTruthy);

export const createEvent = calDav.createEvent;

export const changeEvent = calDav.changeEvent;

export const deleteEvent = calDav.deleteEvent;
