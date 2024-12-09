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
import ProfileModal from './ProfileModal';
import { useLiff } from 'react-liff';

export default function Header() {
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const logoSize = isMobile ? 'h-5 w-5' : 'h-7 w-7';
    const titleSize = isMobile ? 'text-2xl' : 'text-3xl';
    const [lineProfile, setLineProfile] = useState(gameData.getLineProfile());
    const [userInfo, setUserInfo] = useState(gameData._getPlayerInfo());
    const { error, isLoggedIn, isReady, liff } = useLiff();
    const typeColor = {
        kaia: '#BFF009',
        line: '#06C755',
        telegram: '#24A1DE'
    };

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

        const handleUserInfoUpdate = (info) => {
            setUserInfo(info);
        };

        EventBus.on('line-profile-updated', handleLineProfileUpdate);
        EventBus.on('user-info-updated', handleUserInfoUpdate);
        
        return () => {
            EventBus.off('line-profile-updated', handleLineProfileUpdate);
            EventBus.off('user-info-updated', handleUserInfoUpdate);
        };
    }, []);

    useEffect(()=>{
        if(isReady){
            liff.getProfile().then((profile) => {
                console.log(profile);
            });
        }
    },[isReady])

    const handleShowProfile = () => {
        EventBus.emit('show-profile');
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
                            {userInfo?.userAddress ? (
                                <button
                                    onClick={handleShowProfile}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
                                             border font-pixelify"
                                    style={{
                                        borderColor: `${typeColor[userInfo.connectType]}`,
                                        // color: typeColor[userInfo.connectType]
                                    }}
                                >
                                    <img 
                                        src={userInfo.nftImage} 
                                        alt="Profile" 
                                        className="w-6 h-6 rounded-full"
                                    />
                                    {userInfo.nickName}
                                </button>
                            ) : (
                                <ConnectBtn onConnect={handleConnect} />
                            )}
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