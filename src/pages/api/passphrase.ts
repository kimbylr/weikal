import { NextApiRequest, NextApiResponse } from 'next';

const PASSPHRASE = process.env.PASSPHRASE;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { passphrase } = JSON.parse(req.body);

  if (req.method === 'POST' && passphrase) {
    console.log('try passphrase', passphrase === PASSPHRASE ? 'success' : 'fail');
    if (passphrase === PASSPHRASE) {
      return res.status(200).send('success');
    } else {
      return res.status(401).send('unauthorized');
    }
  }

  res.status(500).send('cannot handle request');
};
