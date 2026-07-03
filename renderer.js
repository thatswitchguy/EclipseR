// Tab Management
class TabManager {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.tabCounter = 0;
    }

    createTab(url = 'https://www.google.com') {
        const tabId = this.tabCounter++;
        const tab = {
            id: tabId,
            url: url,
            title: 'New Tab',
            webview: null
        };

        this.tabs.push(tab);
        this.renderTab(tab);
        this.activateTab(tabId);

        return tab;
    }

    renderTab(tab) {
        const tabsContainer = document.getElementById('tabsContainer');
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.id = `tab-${tab.id}`;
        tabElement.innerHTML = `
            <span class="tab-title">${escapeHtml(tab.title)}</span>
            <button class="tab-close" data-tab-id="${tab.id}">×</button>
        `;

        tabElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                this.activateTab(tab.id);
            }
        });

        const closeBtn = tabElement.querySelector('.tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTab(tab.id);
        });

        tabsContainer.appendChild(tabElement);
    }

    activateTab(tabId) {
        // Deactivate previous tab
        if (this.activeTabId !== null) {
            const prevTab = this.tabs.find(t => t.id === this.activeTabId);
            if (prevTab && prevTab.webview) {
                prevTab.webview.style.display = 'none';
            }
            document.getElementById(`tab-${this.activeTabId}`).classList.remove('active');
        }

        // Activate new tab
        this.activeTabId = tabId;
        const tab = this.tabs.find(t => t.id === tabId);
        const tabElement = document.getElementById(`tab-${tabId}`);
        tabElement.classList.add('active');

        if (tab.webview) {
            tab.webview.style.display = 'block';
            updateNavBar(tab);
        }
    }

    closeTab(tabId) {
        const tabIndex = this.tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;

        const tab = this.tabs[tabIndex];
        if (tab.webview) {
            tab.webview.remove();
        }

        document.getElementById(`tab-${tabId}`).remove();
        this.tabs.splice(tabIndex, 1);

        if (this.activeTabId === tabId) {
            if (this.tabs.length > 0) {
                const nextTabId = this.tabs[Math.max(0, tabIndex - 1)].id;
                this.activateTab(nextTabId);
            } else {
                this.activeTabId = null;
            }
        }
    }

    getActiveTab() {
        return this.tabs.find(t => t.id === this.activeTabId);
    }
}

const tabManager = new TabManager();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.querySelector('.content-area');
    const initialTab = tabManager.createTab('https://www.google.com');
    setupWebview(initialTab, contentArea);

    // Event Listeners
    document.getElementById('newTabBtn').addEventListener('click', () => {
        const newTab = tabManager.createTab('https://www.google.com');
        setupWebview(newTab, contentArea);
        document.getElementById('addressBar').focus();
    });

    document.getElementById('backBtn').addEventListener('click', () => {
        const tab = tabManager.getActiveTab();
        if (tab && tab.webview && tab.webview.canGoBack()) {
            tab.webview.goBack();
        }
    });

    document.getElementById('forwardBtn').addEventListener('click', () => {
        const tab = tabManager.getActiveTab();
        if (tab && tab.webview && tab.webview.canGoForward()) {
            tab.webview.goForward();
        }
    });

    document.getElementById('reloadBtn').addEventListener('click', () => {
        const tab = tabManager.getActiveTab();
        if (tab && tab.webview) {
            tab.webview.reload();
        }
    });

    document.getElementById('stopBtn').addEventListener('click', () => {
        const tab = tabManager.getActiveTab();
        if (tab && tab.webview) {
            tab.webview.stop();
        }
    });

    document.getElementById('addressBar').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const tab = tabManager.getActiveTab();
            let url = document.getElementById('addressBar').value.trim();

            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                if (url.includes(' ')) {
                    url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
                } else {
                    url = `https://${url}`;
                }
            }

            if (tab && tab.webview) {
                tab.url = url;
                tab.webview.src = url;
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 't') {
                e.preventDefault();
                const newTab = tabManager.createTab();
                setupWebview(newTab, contentArea);
                document.getElementById('addressBar').focus();
            }
            if (e.key === 'w') {
                e.preventDefault();
                const tab = tabManager.getActiveTab();
                if (tab) {
                    tabManager.closeTab(tab.id);
                }
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                const tabs = tabManager.tabs;
                if (tabs.length === 0) return;
                const currentIndex = tabs.findIndex(t => t.id === tabManager.activeTabId);
                const nextIndex = e.shiftKey ? 
                    (currentIndex - 1 + tabs.length) % tabs.length : 
                    (currentIndex + 1) % tabs.length;
                tabManager.activateTab(tabs[nextIndex].id);
            }
        }
    });

    // Focus address bar on click
    document.getElementById('addressBar').addEventListener('focus', () => {
        document.getElementById('addressBar').select();
    });
});

function setupWebview(tab, contentArea) {
    const webview = document.createElement('webview');
    webview.id = `webview-${tab.id}`;
    webview.src = tab.url;
    webview.style.display = 'none';
    webview.style.width = '100%';
    webview.style.height = '100%';
    webview.style.border = 'none';
    webview.useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    tab.webview = webview;
    contentArea.appendChild(webview);

    // Webview event listeners
    webview.addEventListener('did-start-loading', () => {
        if (tabManager.activeTabId === tab.id) {
            document.getElementById('loadingIndicator').classList.add('active');
        }
    });

    webview.addEventListener('did-stop-loading', () => {
        if (tabManager.activeTabId === tab.id) {
            document.getElementById('loadingIndicator').classList.remove('active');
        }
    });

    webview.addEventListener('page-title-updated', (e) => {
        tab.title = e.title || 'New Tab';
        const tabElement = document.getElementById(`tab-${tab.id}`);
        if (tabElement) {
            tabElement.querySelector('.tab-title').textContent = escapeHtml(tab.title);
        }
    });

    webview.addEventListener('did-navigate', (e) => {
        tab.url = e.url;
        if (tabManager.activeTabId === tab.id) {
            updateNavBar(tab);
        }
    });

    webview.addEventListener('did-navigate-in-page', (e) => {
        tab.url = e.url;
        if (tabManager.activeTabId === tab.id) {
            updateNavBar(tab);
        }
    });

    webview.addEventListener('new-window', (e) => {
        const newTab = tabManager.createTab(e.url);
        setupWebview(newTab, contentArea);
    });

    // Show initially
    if (tabManager.activeTabId === tab.id) {
        webview.style.display = 'block';
        updateNavBar(tab);
    }
}

function updateNavBar(tab) {
    const addressBar = document.getElementById('addressBar');
    addressBar.value = tab.url;

    // Extract hostname and perform DNS lookup
    try {
        const url = new URL(tab.url);
        const hostname = url.hostname;
        performDNSLookup(hostname);
    } catch (e) {
        document.getElementById('dnsInfo').innerHTML = 'Invalid URL';
        document.getElementById('dnsInfo').classList.remove('error');
    }

    // Update navigation buttons state
    const backBtn = document.getElementById('backBtn');
    const forwardBtn = document.getElementById('forwardBtn');

    if (tab.webview) {
        backBtn.disabled = !tab.webview.canGoBack();
        forwardBtn.disabled = !tab.webview.canGoForward();
        backBtn.style.opacity = backBtn.disabled ? '0.5' : '1';
        forwardBtn.style.opacity = forwardBtn.disabled ? '0.5' : '1';
    }
}

async function performDNSLookup(hostname) {
    const dnsInfo = document.getElementById('dnsInfo');
    dnsInfo.classList.remove('error');
    dnsInfo.innerHTML = 'Resolving...';

    try {
        const result = await window.electronAPI.dnsLookup(hostname);
        if (result.error) {
            dnsInfo.innerHTML = `❌ ${result.error}`;
            dnsInfo.classList.add('error');
        } else if (result.ip) {
            dnsInfo.innerHTML = `🌐 IP: ${result.ip}`;
            dnsInfo.classList.add('visible');
        } else if (result.cname) {
            dnsInfo.innerHTML = `🔗 CNAME: ${result.cname}`;
            dnsInfo.classList.add('visible');
        }
    } catch (err) {
        dnsInfo.innerHTML = `❌ Error`;
        dnsInfo.classList.add('error');
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
