// Settings persistence Class
class SettingsManager {
    constructor() {
        this.settings = {
            darkMode: true,
            notifications: false,
            borderRadi: false
        };
        this.loadSettings();
    }

    loadSettings() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.sync.get(['settings'], (result) => {
                if (result.settings) {
                    this.settings = {...this.settings, ...result.settings};
                    this.applySettings();
                }
                this.applyTheme();
                this.applyBorder();
            });
        } else {
            const savedSettings = localStorage.getItem('wdSettings');
            if (savedSettings) {
                this.settings = {...this.settings, ...JSON.parse(savedSettings)};
                this.applySettings();
            }
            this.applyTheme();
            this.applyBorder();
        }
    }

    saveSettings() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.sync.set({ settings: this.settings });
        } else {
            localStorage.setItem('wdSettings', JSON.stringify(this.settings));
        }
    }

    applySettings() {
        document.getElementById('darkMode').checked = this.settings.darkMode;
        document.getElementById('notifications').checked = this.settings.notifications;
        document.getElementById('borderRadi').checked = this.settings.borderRadi;
    }

    applyTheme() {
        const { darkMode } = this.settings;
        document.body.classList.toggle('dark-mode', darkMode);
        document.documentElement.classList.toggle('light-mode', !darkMode);
    }

    applyBorder() {
        const { borderRadi } = this.settings;
        document.body.classList.toggle('rounded-mode', borderRadi);
        document.documentElement.classList.toggle('none-rounded', !borderRadi);
    }
}

// Initialize settings
const settingsManager = new SettingsManager();

document.querySelector('.close-settings').addEventListener('click', () => {
    document.getElementById('settings').classList.remove('show');
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

document.getElementById('darkMode').addEventListener('change', (e) => {
    settingsManager.settings.darkMode = e.target.checked;
    settingsManager.saveSettings();
    settingsManager.applyTheme();
});

document.getElementById('notifications').addEventListener('change', (e) => {
    settingsManager.settings.notifications = e.target.checked;
    settingsManager.saveSettings();
});

document.getElementById('borderRadi').addEventListener('change', (e) => {
    settingsManager.settings.borderRadi = e.target.checked;
    settingsManager.saveSettings();
    settingsManager.applyBorder();
});

// Action buttons
document.getElementById('reportBug').addEventListener('click', () => {
    window.open('https://github.com/your-repo/issues/new', '_blank');
});

document.getElementById('documentation').addEventListener('click', () => {
    window.open('https://naabatechs.com/developers/webdevchecklist', '_blank');
});