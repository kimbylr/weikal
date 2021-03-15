import '../global.css';

import React from 'react';

import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
