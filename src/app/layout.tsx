import '@fullcalendar/common/main.css';
import { Metadata } from 'next';
import { FC, PropsWithChildren } from 'react';
import '../global.css';

export const metadata: Metadata = {
  title: 'Weidling',
  description: 'Weidlingskalender',
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
