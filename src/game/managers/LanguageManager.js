import languages from '../config/languages';

class LanguageManager {
    constructor() {
        this.languages = languages;
        this.currentLanguage = this.detectBrowserLanguage();
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language.split('-')[0];
        if (this.languages[browserLang]) {
            return browserLang;
        }
        return 'en';  // 기본 언어
    }

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