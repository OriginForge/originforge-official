import { useEffect, useCallback } from 'react';

export function TelegramLogin() {
    const handleTelegramAuth = useCallback((user) => {
        console.log('Telegram user:', user);
        // 여기서 사용자 정보를 처리합니다
        // 예: API 호출, 상태 업데이트 등
        alert(
            'Logged in as ' + 
            user.first_name + ' ' + 
            user.last_name + 
            ' (' + user.id + 
            (user.username ? ', @' + user.username : '') + ')'
        );
    }, []);

    useEffect(() => {
        // Telegram 위젯 스크립트 로드
        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute("data-telegram-login", "the_elementa_bot"); // 여기에 실제 봇 이름을 넣으세요
        script.setAttribute("data-size", "medium");
        script.setAttribute("data-request-access", "write");
        script.async = true;

        // 전역 콜백 함수 설정
        window.onTelegramAuth = handleTelegramAuth;

        // 컨테이너에 스크립트 추가
        const container = document.getElementById('telegram-login-container');
        if (container) {
            container.appendChild(script);
        }

        return () => {
            // 클린업: 스크립트 제거
            if (container) {
                container.removeChild(script);
            }
            delete window.onTelegramAuth;
        };
    }, [handleTelegramAuth]);

    return <div id="telegram-login-container" className="flex items-center" />;
} 