import { useAppKitAccount } from '@reown/appkit/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gameData } from '../game/managers/GameDataManager';
import { useMediaQuery } from 'react-responsive';
import logo from '../../public/favicon.png';
import { Menu, Home, Info, Gamepad2, Wallet } from 'lucide-react';

export default function Header() {
    const { address, isConnected } = useAppKitAccount();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const logoSize = isMobile ? 'h-5 w-5' : 'h-7 w-7';
    const titleSize = isMobile ? 'text-2xl' : 'text-3xl';

    useEffect(() => {
        if (isConnected && address) {
            gameData.setWalletAddress(address);
        }
    }, [isConnected, address]);

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
                        {/* Connect Wallet 버튼 주석 처리
                        <button 
                            className={`flex items-center gap-2 rounded-md px-4 py-2 ${
                                isConnected 
                                    ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            <Wallet size={16} />
                            {isConnected 
                                ? `${address?.slice(0,6)}...${address?.slice(-4)}`
                                : 'Connect Wallet'
                            }
                        </button>
                        */}
                        
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