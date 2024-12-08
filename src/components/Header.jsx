import { TelegramLogin } from './TelegramLogin';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { gameData } from '../game/managers/GameDataManager';
import { useMediaQuery } from 'react-responsive';
import logo from '../../public/favicon.png';
import { Menu, Home, Info, Gamepad2, Wallet, X, LogOut } from 'lucide-react';
import { LineLogin } from './LineLogin';
import ConnectModal from './ConnectModal';
import { Lang } from '../game/managers/LanguageManager';
import languages from '../game/config/languages';
import { EventBus } from '../game/EventBus';
import { ConnectBtn } from './ConnectBtn';

export default function Header() {
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const logoSize = isMobile ? 'h-5 w-5' : 'h-7 w-7';
    const titleSize = isMobile ? 'text-2xl' : 'text-3xl';
    const [lineProfile, setLineProfile] = useState(gameData.getLineProfile());
    const [userInfo, setUserInfo] = useState(gameData._getPlayerInfo());

    const handleConnect = () => {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.pointerEvents = 'none';
        }
        setShowConnectModal(true);
    };

    const handleCloseModal = () => {
        setShowConnectModal(false);
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.pointerEvents = 'auto';
        }
    };

    useEffect(() => {
        const handleModalClose = () => {
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.style.pointerEvents = 'auto';
            }
        };

        window.addEventListener('modal-closed', handleModalClose);

        return () => {
            window.removeEventListener('modal-closed', handleModalClose);
        };
    }, []);

    useEffect(() => {
        const handleLineProfileUpdate = (profile) => {
            setLineProfile(profile);
        };

        const handleShowProfile = () => {
            setShowProfileModal(true);
        };

        const handleUserInfoUpdate = (info) => {
            setUserInfo(info);
        };

        EventBus.on('line-profile-updated', handleLineProfileUpdate);
        EventBus.on('show-profile', handleShowProfile);
        EventBus.on('user-info-updated', handleUserInfoUpdate);
        
        return () => {
            EventBus.off('line-profile-updated', handleLineProfileUpdate);
            EventBus.off('show-profile', handleShowProfile);
            EventBus.off('user-info-updated', handleUserInfoUpdate);
        };
    }, []);

    const handleDisconnect = () => {
        gameData.disconnect();
        setShowProfileModal(false);
    };

    const ProfileModal = () => {
        if (!showProfileModal) return null;

        const typeColor = {
            kaia: '#BFF009',
            line: '#06C755',
            telegram: '#24A1DE'
        };

        return (
            <div className="fixed inset-0 flex items-center justify-center z-[9999]">
                <div 
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setShowProfileModal(false)}
                />
                <div className="relative bg-[#03191B]/95 border-2 border-[#01C9A2]/30 rounded-xl w-[400px] p-8 shadow-[0_0_15px_rgba(1,201,162,0.3)] animate-slideIn">
                    <button
                        onClick={() => setShowProfileModal(false)}
                        className="absolute right-4 top-4 text-[#01C9A2] hover:text-white p-1.5 
                                hover:bg-[#01C9A2]/20 rounded-lg transition-all duration-300"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex flex-col items-center gap-4">
                        <img src={userInfo.nftImage} alt="NFT" className="w-32 h-32 rounded-lg border-2" style={{borderColor: typeColor[userInfo.connectType]}} />
                        <h2 className="font-pixelify text-2xl text-white">{userInfo.nickName}</h2>
                        <div className="w-full space-y-2 mt-4">
                            <div className="flex justify-between text-gray-300">
                                <span>Wallet:</span>
                                <span className="text-sm">{userInfo.userAddress?.slice(0,6)}...{userInfo.userAddress?.slice(-4)}</span>
                            </div>
                            
                            <div className="flex justify-between text-gray-300">
                                <span>Point:</span>
                                <span>{userInfo.point || 0}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleDisconnect}
                            className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 
                                     hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-300
                                     border border-red-500/30 hover:border-red-500/50"
                        >
                            <LogOut size={18} />
                            Disconnect
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (    
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-black/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-screen-2xl items-center px-4">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80">
                        {!isMobile && (
                            <img 
                                src={logo}
                                alt="Origin Forge Logo"
                                className={`rounded-lg ${logoSize} pixelated`}
                            />
                        )}
                        {isMobile ? (
                            <img 
                                src="/assets/originText.svg" 
                                alt="Origin Forge"
                                className="h-13"
                            />
                        ) : (
                            <h1 className={`font-pixelify font-bold text-white ${titleSize}`}>
                                Origin-Forge
                            </h1>
                        )}
                    </Link>

                    <div className="flex flex-1 items-center justify-end space-x-4">
                        {!isMobile && (
                            <nav className="flex items-center space-x-6">
                            </nav>
                        )}
                        
                        <div className="flex items-center space-x-4">
                            <ConnectBtn onConnect={handleConnect} />
                        </div>
                    </div>
                </div>
            </header>
            <ConnectModal 
                isOpen={showConnectModal} 
                onClose={handleCloseModal}
            />
            <ProfileModal />
        </>
    );   
}