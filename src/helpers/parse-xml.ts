import { parseString } from 'xml2js';

export const parseXml = (xml: string) => {
  let obj = [];
  parseString(xml, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    obj = result['d:multistatus']['d:response']; // TODO: optional chaining
  });
  return obj;
};
