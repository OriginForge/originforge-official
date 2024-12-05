import { useRef, useState , useEffect } from 'react';
import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NotFound from './components/NotFound';
import { modal } from './main';
import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import liff from "@line/liff"
import '../public/style.css';

function App ({isMobile}){
    const { connect } = useConnect()

    const phaserRef = useRef();

    useEffect(() => {
        liff.init({
            liffId: "2006641289-koZEvRbX"
        }).then(()=>{
            console.log("liff init success");
        }).catch((err)=>{
            console.log("liff init error", err);
        })

        liff.getAppLanguage().then((lang)=>{
            console.log("liff app language", lang);
        })

        liff
  .getProfile()
  .then((profile) => {
    console.log("liff profile", profile);
  })
  .catch((err) => {
    console.log("error", err);
  });
    }, [])
    // useEffect(() => {
    //     if(isMobile){
    //         connect({connector: injected()})
    //     }
    //     return;
    // }, [isMobile])

    return (
        <Router>
            <div id="app">
                <Header />               
                <Routes>
                    <Route path="/" element={<PhaserGame ref={phaserRef} />} />
                    <Route path="/game" element={<PhaserGame ref={phaserRef} />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
