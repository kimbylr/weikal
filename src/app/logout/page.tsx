'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const App = () => {
  const router = useRouter();

  useEffect(() => {
    window.localStorage.clear();
    router.push('/');
  }, []);

  return <div>Logout…</div>;
};

export default App;
