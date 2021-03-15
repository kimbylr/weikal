import { Credentials, Client, transport } from 'dav';
import dayjs, { Dayjs } from 'dayjs';
import binaryToBase64 from 'btoa';

const CALDAV_URL = process.env.CALDAV_URL;
const CALENDAR_NAME = process.env.CALENDAR_NAME;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const getCalDavClient = () => {
  const credentials = new Credentials({ username: USERNAME, password: PASSWORD });
  const xhr = new transport.Basic(credentials);
  return new Client(xhr);
};

export const getCalendar = async (loadObjects = true) => {
  try {
    const account = await getCalDavClient().createAccount({
      server: CALDAV_URL,
      accountType: 'caldav',
      loadObjects,
    });
    return (
      account.calendars.find(({ displayName }) => displayName === CALENDAR_NAME) || null
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const createObj = async (startDate: string, title: string) => {
  const calendar = await getCalendar(false);
  if (!calendar) {
    throw new Error('could not get calendar');
  }

  const filename = `${dayjs().format('YYYY-MM-DD')}_${Math.ceil(Math.random() * 999)}`;
  await getCalDavClient().createCalendarObject(calendar, {
    data: getCard(startDate, title),
    filename,
  });

  const base64auth = binaryToBase64(`${USERNAME}:${PASSWORD}`);
  const res = await fetch(`${CALDAV_URL}/calendars/${USERNAME}/default/${filename}`, {
    headers: { Authorization: `Basic ${base64auth}` },
  });

  const text = await res.text();
  return text
    .split(/\s/)
    .find((line) => line.startsWith('UID:'))
    .replace('UID:', '');
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

export const changeObj = async (id: string, title: string) => {
  const calendar = await getCalendar(true);
  if (!calendar) {
    throw new Error('could not get calendar');
  }

  const calendarObject = calendar.objects.find((obj) => obj.calendarData.includes(id));
  if (!calendarObject) {
    throw new Error('could not find calendarObject');
  }

  const calendarData = calendarObject.calendarData.replace(
    /SUMMARY:.+/,
    `SUMMARY:${title}`,
  );

  await getCalDavClient().updateCalendarObject({ ...calendarObject, calendarData });
};

export const deleteObj = async (id: string) => {
  const calendar = await getCalendar(true);
  if (!calendar) {
    throw new Error('could not get calendar');
  }

  const calendarObject = calendar.objects.find((obj) => obj.calendarData.includes(id));
  if (!calendarObject) {
    throw new Error('could not find calendarObject');
  }

  await getCalDavClient().deleteCalendarObject(calendarObject);
};
