import { TelegramLogin } from './TelegramLogin';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gameData } from '../game/managers/GameDataManager';
import { useMediaQuery } from 'react-responsive';
import logo from '../../public/favicon.png';
import { Menu, Home, Info, Gamepad2, Wallet, Languages, ChevronDown } from 'lucide-react';
import { LineLogin } from './LineLogin';
import ConnectModal from './ConnectModal';
import { Lang } from '../game/managers/LanguageManager';
import languages from '../game/config/languages';

// 지원하는 언어 목록을 languages 객체에서 생성
const SUPPORTED_LANGUAGES = Object.entries(languages).map(([code, data]) => {
    const labels = {
        en: 'English',
        ko: '한국어',
        ja: '日本語',
        de: 'Deutsch',
        es: 'Español',
        fr: 'Français',
        id: 'Bahasa Indonesia',
        it: 'Italiano',
        ms: 'Bahasa Melayu',
        'pt-BR': 'Português (Brasil)',
        'pt-PT': 'Português (Portugal)',
        ru: 'Русский',
        th: 'ไทย',
        tr: 'Türkçe',
        ar: 'العربية',
        vi: 'Tiếng Việt',
        'zh-CN': '简体中文',
        'zh-TW': '繁體中文'
    };
    return {
        code,
        label: labels[code] || code
    };
});

export default function Header() {
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const logoSize = isMobile ? 'h-5 w-5' : 'h-7 w-7';
    const titleSize = isMobile ? 'text-2xl' : 'text-3xl';
    const [currentLang, setCurrentLang] = useState(Lang.getCurrentLanguage());
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const handleWalletClick = () => {
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

    const handleLanguageChange = (lang) => {
        Lang.setLanguage(lang);
        setCurrentLang(lang);
        setIsLangMenuOpen(false);
    };

    // 데스크톱 버전의 언어 선택 드롭다운
    const LanguageDropdown = () => (
        <div className="relative">
            <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 font-pixelify text-gray-300 hover:text-white"
            >
                <Languages size={16} />
                <span>{currentLang.toUpperCase()}</span>
                <ChevronDown size={14} />
            </button>

            {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-black/90 border border-gray-800 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    <div className="py-1">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className="block w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 text-left"
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // 모바일 버전의 언어 선택 버튼들
    const MobileLanguageButtons = () => (
        <>
            {SUPPORTED_LANGUAGES.map((lang) => (
                <button 
                    key={lang.code}
                    onClick={() => {
                        handleLanguageChange(lang.code);
                        setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-6 py-3 font-pixelify text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 w-64"
                >
                    <Languages size={20} />
                    <span className="font-medium">{lang.label}</span>
                </button>
            ))}
        </>
    );

    // 모달이 닫힐 때 상호작용 다시 활성화
    useEffect(() => {
        const handleModalClose = () => {
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.style.pointerEvents = 'auto';
            }
        };

        // 모달이 닫힐 때 이벤트 리스너
        window.addEventListener('modal-closed', handleModalClose);

        return () => {
            window.removeEventListener('modal-closed', handleModalClose);
        };
    }, []);

    return (    
        <>
            <header className="sticky top-0 z-50 w-full border-b bg-black/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-screen-2xl items-center px-4">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80">
                        <img 
                            src={logo}
                            alt="Origin Forge Logo"
                            className={`rounded-lg ${logoSize} pixelated`}
                        />
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
                                <Link to="/about" className="flex items-center gap-2 font-pixelify text-gray-300 hover:text-white">
                                    <Info size={16} />
                                    <span>About</span>
                                </Link>
                                <Link to="/game" className="flex items-center gap-2 font-pixelify text-gray-300 hover:text-white">
                                    <Gamepad2 size={16} />
                                    <span>Game</span>
                                </Link>
                                <LanguageDropdown />
                            </nav>
                        )}
                        
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={handleWalletClick}
                                className="flex items-center gap-2 font-pixelify text-sm rounded-md px-3 py-1.5 transition-colors duration-200 
                                         border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white"
                            >
                                <Wallet size={16} color="#9CA3AF" />
                                Connect
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
                                <MobileLanguageButtons />
                            </nav>
                        </div>
                    )}
                </div>
            </header>
            <ConnectModal 
                isOpen={showConnectModal} 
                onClose={handleCloseModal}
            />
        </>
    );   
}