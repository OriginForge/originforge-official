import { useRef, useState , useEffect } from 'react';
import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';

import { modal } from './main';
import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
function App ({isMobile}){
    const { connect } = useConnect()

    const phaserRef = useRef();

    useEffect(() => {
        if(isMobile){
            connect({connector: injected()})
        }
        return;
    }, [isMobile])

    return (
        <Router>
            <div id="app">
                <Header />               

                {/* <Routes>
                    <Route path="/" element={<PhaserGame ref={phaserRef} />} />
                </Routes> */}
            </div>
        </Router>
    )
}

export default App
