// Copyright 2025 Naaba Technologies LLC
//
// Licensed under the MIT License.
// you are free to use this file, modify and/or redistribute it in any way or form.
// https://naabatech.com/licenses/MIT
// v1.6.24

// Listen for keyboard shortcut commands defined in manifest
chrome.commands.onCommand.addListener((command) => {
    if (command === '_execute_action') {
        chrome.action.openPopup();
    }
});

// Generic handler for context menu clicks
function genericOnClick(info, tab) {
    if (info.menuItemId === "open_dev_checklist") {
        chrome.action.openPopup();
    }

    if (info.menuItemId === "reload_page") {
        chrome.tabs.reload(tab.id);
    }

    if (info.menuItemId === "buy_me_a_coffee") {
        chrome.tabs.create({
            url: 'https://ko-fi.com/N4N51H6XWL'
        })
    }
    if (info.menuItemId === "github_repo") {
        chrome.tabs.create({
            url: 'https://github.com/ayarigab/webdevchecklist'
        })
    }
}

// Create context menu items once the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "open_dev_checklist",
        title: "Open Web Dev Checklist",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "separator",
        type: "separator",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "reload_page",
        title: "Reload this page",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "buy_me_a_coffee",
        title: "Buy me a Coffee",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "github_repo",
        title: "Goto Github Repo",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "help_resource",
        title: "Help resources",
        contexts: ["all"]
    });
});

// Attach the generic click listener to context menus
chrome.contextMenus.onClicked.addListener(genericOnClick);

// Message handler and runtime listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "checkSSL") {
        fetch(`https://ssl-checker.io/api/v1/check/${request.domain}`)
            .then(res => res.json())
            .then(data => {
                if (data?.result?.cert_valid !== undefined) {
                    sendResponse({ success: true, data });
                } else {
                    sendResponse({
                        success: false,
                        error: "Invalid API response structure"
                    });
                }
            })
            .catch(error => sendResponse({
                success: false,
                error: error.message
            }));
        return true;
    }

    if (request.type === "updateBadge") {
        let tabId = sender.tab?.id;
        if (!tabId) {
            // fallback: get active tab if sender.tab is unavailable
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    tabId = tabs[0].id;
                    updateBadgeForTab(tabId, request, sendResponse);
                } else {
                    console.error("No active tab found");
                    sendResponse({ success: false, error: "No tabId found" });
                }
            });

            return true;
        } else {
            updateBadgeForTab(tabId, request, sendResponse);
            return true;
        }
    }

    function updateBadgeForTab(tabId, request, sendResponse) {
        chrome.action.setBadgeText({
            tabId,
            text: request.errors > 0 ? String(request.count) : 'WD-C',
        });

        chrome.action.setBadgeBackgroundColor({
            tabId,
            color: request.errors > 0 ? "#ff5252" : "#50b154",
        });

        chrome.action.setTitle({
            tabId,
            title: `WebDev Checklist - Issues detected: ${request.errors} errors, ${request.count - request.errors} warnings`,
        });

        sendResponse({ success: true });
    }


    if (request.type === "result") {
        chrome.runtime.sendMessage({ type: "done", data: request.data });
    }

    return false;
});