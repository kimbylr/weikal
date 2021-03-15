import { NextApiRequest, NextApiResponse } from 'next';
import { changeObj, deleteObj } from '../../../services/cal-dav';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.headers.passphrase !== process.env.PASSPHRASE) {
    res.status(401).send('unauthorized');
  }

  const { id } = req.query;
  const { title } = JSON.parse(req.body);

  if (typeof id !== 'string') {
    return res.status(500).send('id must be a string');
  }

  if (req.method === 'PUT' && id && title) {
    console.log('change event:', id, title);
    try {
      await changeObj(id, title);
      return res.status(200).send('success');
    } catch (e) {
      return res.status(500).send(e);
    }
  }

  if (req.method === 'DELETE' && id) {
    console.log('delete event:', id);
    try {
      await deleteObj(id);
      return res.status(200).send('success');
    } catch (e) {
      return res.status(500).send(e);
    }
  }

  res.status(500).send('cannot handle request');
};
