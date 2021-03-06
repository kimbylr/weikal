import { NextApiRequest, NextApiResponse } from 'next';
import { createEvent } from '../../../services/cal-dav';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.headers.passphrase !== process.env.PASSPHRASE) {
    return res.status(401).send('unauthorized');
  }

  const { startDate, title } = JSON.parse(req.body);

  if (req.method === 'POST' && startDate && title) {
    console.log('create event:', startDate, title);
    try {
      const { id, filename } = await createEvent(startDate, title);
      return res.status(200).json({ id, filename });
    } catch (e) {
      return res.status(500).send(e);
    }
  }

  res.status(400).send('cannot handle request');
};
