import dayjs, { Dayjs } from 'dayjs';
import binaryToBase64 from 'btoa';
import { parseXml } from '../helpers/parse-xml';

const CALDAV_SERVER = process.env.CALDAV_SERVER;
const CALDAV_PATH = process.env.CALDAV_PATH;
const CALENDAR_KEY = process.env.CALENDAR_KEY;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const authHeader = {
  Authorization: `Basic ${binaryToBase64(`${USERNAME}:${PASSWORD}`)}`,
};

const getUrl = (filename: string) =>
  `${CALDAV_SERVER}${CALDAV_PATH}/calendars/${USERNAME}/${CALENDAR_KEY}/${filename}${
    filename.endsWith('.ics') ? '' : '.ics'
  }`;

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

export const getAllEvents = async () => {
  const path = `${CALDAV_PATH}/calendars/${USERNAME}/${CALENDAR_KEY}/`;
  try {
    const res = await fetch(`${CALDAV_SERVER}${path}`, {
      method: 'REPORT',
      headers: { ...authHeader, Depth: '1' },
      body: GET_CAL,
    });
    const xml = await res.text();
    return parseXml(xml).map((event) => ({
      filename: event['d:href'][0].replace(path, ''),
      calendarData: event['d:propstat'][0]['d:prop'][0]['cal:calendar-data'][0],
    }));
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const createEvent = async (startDate: string, title: string) => {
  const hash = Math.ceil(Math.random() * 999999);
  const filename = `${dayjs().format('YYYY-MM-DD')}_${hash}`;
  const url = getUrl(filename);
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
      .replace('UID:', '');
    return { id, filename };
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const changeEvent = async (filename: string, title: string) => {
  const url = getUrl(filename);
  const res = await fetch(url, { headers: authHeader });
  const body = (await res.text()).replace(/SUMMARY:.+/, `SUMMARY:${title}`);
  await fetch(url, { method: 'PUT', headers: authHeader, body });
};

export const deleteEvent = async (filename: string) => {
  const url = getUrl(filename);
  await fetch(url, { method: 'DELETE', headers: authHeader });
};
