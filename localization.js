class LocalizationHelper {
    static messages = {};
    static isInitialized = false;
    static initializationPromise = null;

    static availableLanguages = {
        'browser': 'Browser Default',
        'en': 'English',
        'es': 'Español',
        'fr': 'Français',
        'hi': 'हिन्दी',
        'de': 'Deutsch',
        'it': 'Italiano',
        'zh-CN': '中文',
        'pt': 'Português',
        'ru': 'Русский'
    };

    static async init() {
        // If already initialized, return immediately
        if (this.isInitialized) return;
        
        // If initialization is in progress, wait for it
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        // Start initialization
        this.initializationPromise = (async () => {
            await this.loadLanguageSelector();
            await this.applyLanguage();
            this.setupLanguageChangeListener();
            this.isInitialized = true;
        })();
        
        return this.initializationPromise;
    }

    static getMessage(key, substitutions = []) {
        // If messages aren't loaded yet, return the key
        if (!this.messages || Object.keys(this.messages).length === 0) {
            console.warn(`Messages not loaded yet. Key: ${key}`);
            return key;
        }
        
        try {
            let message = this.messages[key] || key;
            
            // Handle substitutions
            if (substitutions && substitutions.length > 0) {
                substitutions.forEach((sub, index) => {
                    message = message.replace(`$${index + 1}`, sub);
                });
            }
            
            return message;
        } catch (e) {
            console.warn(`Translation failed: ${key}`, e);
            return key;
        }
    }

    static async getLanguagePreference() {
        const { language } = await chrome.storage.sync.get('language');
        if (!language || language === 'browser') {
            const browserLang = chrome.i18n.getUILanguage().split('-')[0];
            return Object.keys(this.availableLanguages).includes(browserLang) ? browserLang : 'en';
        }
        return language;
    }
    
    // Function to fetch and load a messages.json file
    static async loadMessages(lang) {
        try {
            const messagesUrl = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
            const response = await fetch(messagesUrl);
            if (!response.ok) {
                throw new Error(`Could not load messages for language: ${lang}`);
            }
            const messagesData = await response.json();
            this.messages = Object.fromEntries(
              Object.entries(messagesData).map(([key, value]) => [key, value.message])
            );
        } catch (error) {
            console.error(error);
            if (lang !== 'en') {
                await this.loadMessages('en');
            }
        }
    }

    static async applyLanguage() {
        const lang = await this.getLanguagePreference();
        document.documentElement.lang = lang;
        await this.loadMessages(lang);
        this.applyTranslations();
    }

    static applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.messages[key]) {
                el.textContent = this.messages[key];
            }
        });

        ['title', 'aria-label'].forEach(attr => {
            document.querySelectorAll(`[data-i18n-${attr}]`).forEach(el => {
                const key = el.getAttribute(`data-i18n-${attr}`);
                if (this.messages[key]) {
                    el.setAttribute(attr, this.messages[key]);
                }
            });
        });
    }

    static async loadLanguageSelector() {
        const select = document.getElementById('selectLang');
        if (!select) return;

        const { language: storedPref = 'browser' } = await chrome.storage.sync.get('language');

        select.innerHTML = Object.entries(this.availableLanguages)
            .map(([code, name]) => `<option value="${code}" ${code === storedPref ? 'selected' : ''}>${name}</option>`)
            .join('');
    }

    static setupLanguageChangeListener() {
        const select = document.getElementById('selectLang');
        if (!select) return;

        select.addEventListener('change', async (e) => {
            const lang = e.target.value;
            await chrome.storage.sync.set({ language: lang });
            await this.applyLanguage();
        });
    }
}

window.i18n = (key, substitutions = []) => {
    return LocalizationHelper.getMessage(key, substitutions);
};

document.addEventListener('DOMContentLoaded', () => {
    LocalizationHelper.init();
});