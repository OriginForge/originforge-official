// 카이카스 로그인 컴포넌트

import React, { useEffect, useState } from 'react';
import { Lang } from '../game/managers/LanguageManager';
import { gameData } from '../game/managers/GameDataManager';
import { EventBus } from '../game/EventBus';

export const KaiaLogin = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    // Kaia 지갑 연결 가능 여부 확인
    useEffect(() => {
        const checkKaiaAvailable = () => {
            if (typeof window.klaytn === 'undefined') {
                setIsDisabled(true);
            }
        };
        checkKaiaAvailable();
    }, []);

    // Kaia 지갑 연결 핸들러
    const handleConnect = async () => {
        if (isDisabled) return;
        
        try {
            const accounts = await window.klaytn.enable();

            
            const isUser = await gameData._checkIsUser(accounts[0]);
            
            if(!isUser){
                gameData.setPlayerInfo_kaia(accounts[0]);
                gameData.getWalletAddress()
                // ConnectModal 닫기
                EventBus.emit('connect-modal-closed');
                // MainScene의 checkWallet 실행
                EventBus.emit('check-wallet');
            } else {
               await  gameData.getPlayerInfo(accounts[0], 'kaia');
                EventBus.emit('connect-modal-closed');
            }

            // console.log('Connected account:', accounts[0]);
            
            // // 계정 변경 이벤트 리스너
            // window.klaytn.on('accountsChanged', function(accounts) {
            //     console.log('Account changed:', accounts[0]);
            // });
        } catch (error) {
            console.error('Failed to connect to Kaia:', error);
        }
    };

    const getButtonIcon = () => {
        return '/assets/connector/Kaia/btn_base.png';
    };

    const getButtonStyle = () => {
        if (isDisabled) {
            return 'bg-white border border-[#E5E5E5] border-opacity-60 text-[#1E1E1E] text-opacity-20';
        }
        
        // Safari에서 색상이 제대로 적용되도록 hex 코드 사용
        const baseStyle = 'bg-[#000000]'; // 명시적 hex 코드 사용
        if (isPressed) {
            return `${baseStyle} relative after:absolute after:inset-0 after:bg-[#000000] after:opacity-30`; 
        }
        if (isHovered) {
            return `${baseStyle} relative after:absolute after:inset-0 after:bg-[#000000] after:opacity-10`;
        }
        return baseStyle;
    };

    // 언어별 텍스트
    const languageTexts = {
        en: 'Kaia Wallet',
        ko: 'Kaia Wallet',
        ja: 'Kaia Wallet',
        'zh-CN': 'Kaia Wallet',
        'zh-TW': 'Kaia Wallet'
    };

    const currentLang = Lang.getCurrentLanguage();
    const buttonText = languageTexts[currentLang] || languageTexts.en;

    return (
        <button
            onClick={handleConnect}
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
                min-w-[280px]
                ${getButtonStyle()}
            `}
            style={{
                // Safari를 위한 fallback 스타일
                backgroundColor: isDisabled ? '#FFFFFF' : '#000000'
            }}
        >
            {/* 왼쪽 아이콘 영역 */}
            <div className="flex items-center justify-center w-[52px] h-full relative">
                <img 
                    src={'/assets/connector/Kaia/btn_base.png'}
                    alt="Kaia Logo"
                    className="w-6 h-6 z-20"
                    style={{ 
                        filter: isDisabled ? 'grayscale(100%)' : 'none',
                        // Safari에서 이미지가 잘 보이도록 보정
                        WebkitFilter: isDisabled ? 'grayscale(100%)' : 'none'
                    }}
                />
                {/* 수직 구분선 */}
                <div 
                    className="absolute right-0 top-2 bottom-2 w-px z-10" 
                    style={{
                        // Safari를 위한 명시적 배경색 지정
                        backgroundColor: 'rgba(191, 240, 9, 0.08)'
                    }}
                />
            </div>

            {/* 텍스트 영역 */}
            <div 
                className={`
                    flex-1 text-center pr-[52px] z-20
                `}
                style={{
                    // Safari를 위한 텍스트 색상 명시적 지정
                    color: isDisabled ? 'rgba(30, 30, 30, 0.2)' : '#FFFFFF'
                }}
            >
                {buttonText}
            </div>
        </button>
    );
};

export default KaiaLogin;
