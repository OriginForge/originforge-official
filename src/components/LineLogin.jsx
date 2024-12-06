import React, { useEffect, useState } from 'react';
import { useLiff } from 'react-liff';
import { Lang } from '../game/managers/LanguageManager';

export const LineLogin = () => {
    const [displayName, setDisplayName] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const { error, isLoggedIn, isReady, liff } = useLiff();

    useEffect(() => {
        if (!isLoggedIn) return;

        (async () => {
            const profile = await liff.getProfile();
            setDisplayName(`${profile.displayName} (${profile.userId})`);
        })();
    }, [liff, isLoggedIn]);

    const getButtonIcon = () => {
        if (isDisabled) return '/assets/connector/line/btn_disabled.png';
        if (isPressed) return '/assets/connector/line/btn_press.png';
        if (isHovered) return '/assets/connector/line/btn_hover.png';
        return '/assets/connector/line/btn_base.png';
    };

    const getButtonStyle = () => {
        if (isDisabled) {
            return 'bg-white border border-[#E5E5E5] border-opacity-60 text-[#1E1E1E] text-opacity-20';
        }
        
        const baseStyle = 'bg-[#06C755]';
        if (isPressed) {
            return `${baseStyle} relative after:absolute after:inset-0 after:bg-black after:opacity-30`;
        }
        if (isHovered) {
            return `${baseStyle} relative after:absolute after:inset-0 after:bg-black after:opacity-10`;
        }
        return baseStyle;
    };

    const currentLang = Lang.getCurrentLanguage();
    const content = languageTexts[currentLang] || languageTexts.en;

    return (
        <button
            onClick={!isDisabled ? liff.login : undefined}
            onMouseEnter={() => !isDisabled && setIsHovered(true)}
            onMouseLeave={() => {
                if (!isDisabled) {
                    setIsHovered(false);
                    setIsPressed(false);
                }
            }}
            onMouseDown={() => !isDisabled && setIsPressed(true)}
            onMouseUp={() => !isDisabled && setIsPressed(false)}
            disabled={isDisabled}
            className={`
                relative
                flex items-center
                w-full h-12
                rounded-md
                font-sans font-medium text-base
                transition-all duration-200
                overflow-hidden
                ${getButtonStyle()}
                ${!isDisabled && 'text-white'}
            `}
            style={{
                direction: currentLang === 'ar' ? 'rtl' : 'ltr'
            }}
        >
            <div className="flex items-center justify-center w-[52px] h-full relative">
                <img 
                    src={getButtonIcon()}
                    alt="LINE Logo"
                    className="w-6 h-6 z-20"
                />
                <div className="absolute right-0 top-2 bottom-2 w-px bg-black bg-opacity-[0.08] z-10" />
            </div>
            <div className="flex-1 text-center pr-[52px] z-20">
                {content.text}
            </div>
        </button>
    );
};

// 언어별 텍스트 매핑
const languageTexts = {
    en: { text: 'Log in with LINE', short: 'Log in' },
    ja: { text: 'LINEでログイン', short: 'ログイン' },
    ko: { text: 'LINE으로 로그인', short: '로그인' },
    // ... 다른 언어 설정
};

export default LineLogin;