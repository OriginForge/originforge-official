import { useAppKitAccount, useAppKit,useWalletInfo } from '@reown/appkit/react';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gameData } from '../game/managers/GameDataManager';
import { useMediaQuery } from 'react-responsive';
import logo from '../../public/favicon.png';
import { Menu, Home, Info, Gamepad2, Wallet } from 'lucide-react';

export default function Header() {
    const { address, isConnected } = useAppKitAccount();
    const {walletInfo} = useWalletInfo();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {open,close} = useAppKit();
    const logoSize = isMobile ? 'h-5 w-5' : 'h-7 w-7';
    const titleSize = isMobile ? 'text-2xl' : 'text-3xl';

    useEffect(() => {
        if (isConnected && address) {
            gameData.setWalletAddress(address);
        }
        if(!isConnected) {
            gameData.setWalletAddress(null);
        }
    }, [isConnected, address]);

    const handleWalletClick = () => {
        if (isConnected) {
            open({ view: 'Account' })();
        } else {
            open()();
        }
    };

    return (    
        <header className="sticky top-0 z-50 w-full border-b bg-black/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-screen-2xl items-center px-4">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80">
                    <img 
                        src={logo}
                        alt="Origin Forge Logo"
                        className={`rounded-lg ${logoSize} pixelated`}
                        
                    />
                    <h1 className={`font-pixelify font-bold text-white ${titleSize} `}>
                        {isMobile ? 'Origin-Forge' : 'Origin-Forge'}
                    </h1>
                </Link>

                <div className="flex flex-1 items-center justify-end space-x-4">
                    {!isMobile && (
                        <nav className="flex items-center space-x-6">
                            <Link to="/about" className="flex items-center gap-2 font-pixelify text-gray-300 hover:text-white">
                                <Info size={16} />
                                <span>About</span>
                            </Link>
                            <Link to="/game" className="flex items-center gap-2 font-pixelify text-gray-300 hover:text-white">
                                <Gamepad2 size={16} />
                                <span>Game</span>
                            </Link>
                        </nav>
                    )}
                    
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={handleWalletClick}
                            className="flex items-center gap-2 font-pixelify text-sm rounded-md px-3 py-1.5 transition-colors duration-200 
                                     border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white"
                        >
                            <Wallet size={16} color={isConnected ? "#BFF009" : "#9CA3AF"} />
                            {isConnected 
                                ? `${address?.slice(0,4)}...${address?.slice(-4)}`
                                : 'Connect'
                            }
                        </button>
                        
                        {isMobile && (
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="rounded-md p-2 hover:bg-gray-700 text-white"
                            >
                                <Menu size={24} />
                            </button>
                        )}
                    </div>
                </div>

                {isMobile && isMenuOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur border-b border-gray-800">
                        <nav className="flex flex-col items-center py-6 space-y-4">
                            <Link to="/" 
                                className="flex items-center gap-3 px-6 py-3 font-pixelify text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 w-64"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Home size={20} />
                                <span className="font-medium">Home</span>
                            </Link>
                            <Link to="/about" 
                                className="flex items-center gap-3 px-6 py-3 font-pixelify text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 w-64"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Info size={20} />
                                <span className="font-medium">About</span>
                            </Link>
                            <Link to="/game" 
                                className="flex items-center gap-3 px-6 py-3 font-pixelify text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 w-64"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Gamepad2 size={20} />
                                <span className="font-medium">Game</span>
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );   
}