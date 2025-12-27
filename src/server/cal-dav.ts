import 'server-only';

import binaryToBase64 from 'btoa';
import dayjs, { Dayjs } from 'dayjs';
import { getCalendarKeyOrThrow } from './user';
import { parseXml } from '../util/parse-xml';

const CALDAV_SERVER = process.env.CALDAV_SERVER;
const CALDAV_PATH = process.env.CALDAV_PATH;
const USERNAME = process.env.CALDAV_USERNAME;
const PASSWORD = process.env.CALDAV_PASSWORD;

const baseUrl = `${CALDAV_PATH}/calendars/${USERNAME}`;

const getCalendarUrl = (passphrase: string, includeDomain = true) =>
  `${includeDomain ? CALDAV_SERVER : ''}${baseUrl}/${getCalendarKeyOrThrow(passphrase)}/`;

const getUrl = ({ filename, passphrase }: { filename: string; passphrase: string }) =>
  `${getCalendarUrl(passphrase)}${filename}${filename.endsWith('.ics') ? '' : '.ics'}`;

const authHeader = {
  Authorization: `Basic ${binaryToBase64(`${USERNAME}:${PASSWORD}`)}`,
};

const getCard = (startDate: string, title: string) => `BEGIN:VCALENDAR
PRODID:-//kimskal//EN
VERSION:2.0
BEGIN:VEVENT
DTSTAMP:${formatDate(dayjs()) /** updated */}
DTSTART;VALUE=DATE:${dayjs(startDate).format('YYYYMMDD')}
DTEND;VALUE=DATE:${dayjs(startDate).add(1, 'day').format('YYYYMMDD')}
SUMMARY:${title}
END:VEVENT
END:VCALENDAR
`;

const formatDate = (date: Dayjs) =>
  date
    .toISOString()
    .replace(/[-:.]/gi, '')
    .replace(/\d{0,3}Z/, 'Z');

const GET_CAL = `<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
    <d:prop>
        <d:getetag />
        <c:calendar-data />
    </d:prop>
    <c:filter>
        <c:comp-filter name="VCALENDAR">
            <c:comp-filter name="VEVENT" />
        </c:comp-filter>
    </c:filter>
</c:calendar-query>`;

export const getAllEvents = async (passphrase: string) => {
  try {
    const res = await fetch(getCalendarUrl(passphrase), {
      method: 'REPORT',
      headers: { ...authHeader, Depth: '1' },
      body: GET_CAL,
    });
    return parseXml(await res.text()).map((event) => ({
      filename: event['d:href'][0].replace(getCalendarUrl(passphrase, false), ''),
      calendarData: event['d:propstat'][0]['d:prop'][0]['cal:calendar-data'][0],
    }));
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const createEvent = async ({
  startDate,
  title,
  passphrase,
}: {
  startDate: string;
  title: string;
  passphrase: string;
}) => {
  const hash = Math.ceil(Math.random() * 999999);
  const filename = `${dayjs().format('YYYY-MM-DD')}_${hash}`;
  const url = getUrl({ filename, passphrase });

  try {
    await fetch(url, {
      method: 'PUT', // apparently ¯\_(ツ)_/¯
      headers: authHeader,
      body: getCard(startDate, title),
    });
    // get newly created event in order to return its UID
    const res = await fetch(url, { headers: authHeader });
    const text = await res.text();
    const id = text
      .split(/\s/)
      .find((line) => line.startsWith('UID:'))
      ?.replace('UID:', '');
    if (!id) throw new Error('Could not find event after creating');
    return { id, filename };
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const changeEvent = async ({
  filename,
  title,
  passphrase,
}: {
  filename: string;
  title: string;
  passphrase: string;
}) => {
  try {
    const url = getUrl({ filename, passphrase });
    const res = await fetch(url, { method: 'GET', headers: authHeader });
    const body = (await res.text()).replace(/SUMMARY:.+/, `SUMMARY:${title}`);
    await fetch(url, { method: 'PUT', headers: authHeader, body });
    return true;
  } catch (e) {
    console.log('Error changing event', e);
    return false;
  }
};

export const deleteEvent = async ({
  filename,
  passphrase,
}: {
  filename: string;
  passphrase: string;
}) => {
  try {
    await fetch(getUrl({ filename, passphrase }), {
      method: 'DELETE',
      headers: authHeader,
    });
    return true;
  } catch (e) {
    console.log('Error deleting event', e);
    return false;
  }
};
