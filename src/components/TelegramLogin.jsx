import { useEffect, useCallback } from 'react';

export function TelegramLogin() {
    const handleTelegramAuth = useCallback((user) => {
        // 텔레그램 로그인 데이터 콘솔에 출력
        console.log('Telegram user data:', {
            id: user.id, // 텔레그램 유저 ID
            first_name: user.first_name, // 이름
            last_name: user.last_name, // 성
            username: user.username, // 유저네임 
            photo_url: user.photo_url, // 프로필 사진 URL
            auth_date: user.auth_date, // 인증 날짜
            hash: user.hash // 데이터 검증용 해시
        });
    }, []);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute("data-telegram-login", "the_elementa_bot");
        script.setAttribute("data-size", "medium");
        script.setAttribute("data-request-access", "write");
        script.async = true;

        window.onTelegramAuth = handleTelegramAuth;

        const container = document.getElementById('telegram-login-container');
        if (container) {
            container.appendChild(script);
        }

        return () => {
            if (container) {
                container.removeChild(script);
            }
            delete window.onTelegramAuth;
        };
    }, [handleTelegramAuth]);

    return <div id="telegram-login-container" className="flex items-center" />;
}