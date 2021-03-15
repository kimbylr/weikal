import { NextApiRequest, NextApiResponse } from 'next';
import { changeEvent, deleteEvent } from '../../../services/cal-dav';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.headers.passphrase !== process.env.PASSPHRASE) {
    res.status(401).send('unauthorized');
  }

  const { filename } = req.query;
  const { title } = JSON.parse(req.body);

  if (typeof filename !== 'string') {
    return res.status(500).send('id must be a string');
  }

  if (req.method === 'PUT' && filename && title) {
    console.log('change event:', filename, title);
    try {
      await changeEvent(filename, title);
      return res.status(200).send('success');
    } catch (e) {
      return res.status(500).send(e);
    }
  }

  if (req.method === 'DELETE' && filename) {
    console.log('delete event:', filename);
    try {
      await deleteEvent(filename);
      return res.status(200).send('success');
    } catch (e) {
      return res.status(500).send(e);
    }
  }

  res.status(500).send('cannot handle request');
};
