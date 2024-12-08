import { useRef, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PhaserGame } from './game/PhaserGame';
import Header from './components/Header';
import NotFound from './components/NotFound';
import { useLiff } from 'react-liff';
import UserRoutePage from './components/User/UserRoutePage';
import '../public/style.css';
import { HelmetProvider, Helmet } from 'react-helmet-async';

// 레이아웃 컴포넌트
function Layout({ children }) {
  return (
    <div id="app">
      <Header />
      {children}
    </div>
  );
}

function App({ isMobile }) {
  const [displayName, setDisplayName] = useState(null);
  const { error, isLoggedIn, isReady, liff } = useLiff();
  const phaserRef = useRef();

  useEffect(() => {
    if (!isLoggedIn) return;
    
    (async () => {
      const profile = await liff.getProfile();
      setDisplayName(profile.displayName);
    })();
  }, [liff, isLoggedIn]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Layout>
          <Helmet>
            <base href="/" />
            <link rel="icon" type="image/png" href="/favicon.png" />
            <link rel="shortcut icon" type="image/png" href="/favicon.png" />
            <link rel="apple-touch-icon" href="/favicon.png" />
          </Helmet>
          <Routes>
            <Route path="/" element={<PhaserGame ref={phaserRef} />} />
            <Route path="/game" element={<PhaserGame ref={phaserRef} />} />
            <Route path="/user/:nickname" element={<UserRoutePage />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/user" element={<Navigate to="/404" replace />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
