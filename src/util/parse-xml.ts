import { parseString } from 'xml2js';

export const parseXml = (xml: string) => {
  let obj: string[] = [];

  parseString(xml, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    obj = result?.['d:multistatus']?.['d:response'];
  });

  return obj;
};
