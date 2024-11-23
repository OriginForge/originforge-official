import ko from '../config/languages/ko';
import en from '../config/languages/en';

class LanguageManager {
    constructor() {
        this.languages = {
            ko,
            en
        };
        this.currentLanguage = 'en';  // 기본 언어
        
        // 브라우저 언어 감지
        // this.detectLanguage();
    }

    // detectLanguage() {
    //     const browserLang = navigator.language.split('-')[0];
    //     if (this.languages[browserLang]) {
    //         this.currentLanguage = browserLang;
    //     }
    // }

    setLanguage(lang) {
        if (this.languages[lang]) {
            this.currentLanguage = lang;
            // 언어 변경 이벤트 발생
            EventBus.emit('language-changed', lang);
        }
    }

    get(key) {
        const keys = key.split('.');
        let value = this.languages[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                console.warn(`Missing translation key: ${key}`);
                return key;
            }
        }
        
        return value;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

export const Lang = new LanguageManager(); 