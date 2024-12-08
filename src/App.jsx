import { useRef, useState , useEffect } from 'react';
import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Header from './components/Header';
import NotFound from './components/NotFound';
// import { modal } from './main';
// import { useConnect } from 'wagmi'
// import { injected } from 'wagmi/connectors'
import liff from "@line/liff"
import {useLiff} from 'react-liff'
import UserRoutePage from './components/User/UserRoutePage';
import '../public/style.css';
import { HelmetProvider } from 'react-helmet-async';

function App ({isMobile}){
    // const { connect } = useConnect()
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
    
      const showDisplayName = () => {
        if (error) return <p>Something is wrong.</p>;
        if (!isReady) return <p>Loading...</p>;
    
        if (!isLoggedIn) {
          return (
            <button className="App-button" onClick={liff.login}>
              Login
            </button>
          );
        }
        return (
          <>
            <p>Welcome to the react-liff demo app, {displayName}!</p>
            <button className="App-button" onClick={liff.logout}>
              Logout
            </button>
          </>
        );
      };
    // useEffect(() => {
    //     if(isMobile){
    //         connect({connector: injected()})
    //     }
    //     return;
    // }, [isMobile])

    return (
        <HelmetProvider>
            <Router>
                <div id="app">
                    <Header />    
                    
                    <Routes>
                        <Route path="/" element={<PhaserGame ref={phaserRef} />} />
                        <Route path="/game" element={<PhaserGame ref={phaserRef} />} />
                        <Route path="*" element={<NotFound />} />
                        <Route path="/user/:nickname" element={<UserRoutePage />} />
                    </Routes>
                </div>
            </Router>
        </HelmetProvider>
    )
}

export default App
