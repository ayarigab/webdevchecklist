class SettingsManager {
    constructor() {
        this.settings = {
            darkMode: true,
            notifications: false,
            borderRadi: false
        };
        this.cacheDOM();
        this.init();
    }

    cacheDOM() {
        this.dom = {
            darkModeToggle: document.getElementById('darkMode'),
            notificationsToggle: document.getElementById('notifications'),
            borderRadiToggle: document.getElementById('borderRadi'),
            body: document.body,
            html: document.documentElement
        };
    }

    async init() {
        await this.loadSettings();
        this.applySettings();
        this.bindEvents();
    }

    async loadSettings() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.sync.get(['settings']);
                if (result.settings) {
                    this.settings = { ...this.settings, ...result.settings };
                }
            } else {
                const savedSettings = localStorage.getItem('wdSettings');
                if (savedSettings) {
                    this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async saveSettings() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.sync.set({ settings: this.settings });
            } else {
                localStorage.setItem('wdSettings', JSON.stringify(this.settings));
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    applySettings() {
        const { darkModeToggle, notificationsToggle, borderRadiToggle } = this.dom;
        const { darkMode, notifications, borderRadi } = this.settings;

        darkModeToggle.checked = darkMode;
        notificationsToggle.checked = notifications;
        borderRadiToggle.checked = borderRadi;

        this.applyTheme();
        this.applyBorder();
    }

    applyTheme() {
        const { body, html } = this.dom;
        const { darkMode } = this.settings;

        body.classList.toggle('dark-mode', darkMode);
        html.classList.toggle('light-mode', !darkMode);
    }

    applyBorder() {
        const { body, html } = this.dom;
        const { borderRadi } = this.settings;

        body.classList.toggle('rounded-mode', borderRadi);
        html.classList.toggle('none-rounded', !borderRadi);
    }

    bindEvents() {
        const { darkModeToggle, notificationsToggle, borderRadiToggle } = this.dom;

        darkModeToggle.addEventListener('change', (e) => {
            this.settings.darkMode = e.target.checked;
            this.saveSettings();
            this.applyTheme();
        });

        notificationsToggle.addEventListener('change', (e) => {
            this.settings.notifications = e.target.checked;
            this.saveSettings();
        });

        borderRadiToggle.addEventListener('change', (e) => {
            this.settings.borderRadi = e.target.checked;
            this.saveSettings();
            this.applyBorder();
        });
    }
}

class TabManager {
    constructor() {
        this.tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
        this.tabPanes = Array.from(document.querySelectorAll('.tab-pane'));
        this.bindEvents();
    }

    bindEvents() {
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });
    }

    switchTab(activeBtn) {
        // Remove active class from all buttons and panes
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabPanes.forEach(pane => pane.classList.remove('active'));

        // Add active class to clicked button and corresponding pane
        activeBtn.classList.add('active');
        const activePane = document.getElementById(activeBtn.dataset.tab);
        if (activePane) activePane.classList.add('active');
    }
}

class ActionManager {
    static bindActions() {
        document.getElementById('reportBug')?.addEventListener('click', () => {
            window.open('https://github.com/ayarigab/webdevchecklist/issues/new', '_blank');
        });

        document.getElementById('documentation')?.addEventListener('click', () => {
            window.open('https://github.com/ayarigab/webdevchecklist', '_blank');
        });

        document.querySelector('.close-settings')?.addEventListener('click', () => {
            document.getElementById('settings')?.classList.remove('show');
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize all modules
    new SettingsManager();
    new TabManager();
    ActionManager.bindActions();

    // Initialize localization if needed
    if (typeof LocalizationHelper !== 'undefined') {
        await LocalizationHelper.init();
    }
});