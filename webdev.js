let hasRun = false;
const parser = new DOMParser();

const safeInnerHTML = (parent, string) => {
    const children = parser.parseFromString(string, "text/html").body.childNodes;
    for (let node of children) {
        parent.appendChild(node.cloneNode(true));
    }
};

let donate = document.getElementById('donate');
let settingBtn = document.getElementById('settingsBtn');
let setting = document.getElementById('settings');
let logo = document.getElementById('logo');

donate.addEventListener("click", function(e) {
    e.preventDefault;
    window.open('https://ko-fi.com/N4N51H6XWL', '_blank');
});

settingBtn.addEventListener("click", function(e) {
    e.preventDefault();
    setting.classList.toggle("show");
});

logo.addEventListener("click", function(e) {
    e.preventDefault();
    window.open('https://ko-fi.com/N4N51H6XWL', '_blank');
});

(async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) {
            return;
        }

        if (!tab.url || !tab.url.startsWith("http")) {
            const ul = document.createElement("div");
            ul.classList.add('error-page');

            const header = document.createElement("div");
            header.classList.add('error-header');
            const content = document.createElement("p");
            content.classList.add('error-content');
            const errorImg = `<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" class="error-img warn-color" viewBox="0 0 20 20"><path fill="currentColor" fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5m0 9a1 1 0 1 0 0-2a1 1 0 0 0 0 2" clip-rule="evenodd"/></svg>`;
            header.innerText = "Unable to analyze the current page";
            content.innerText = `The URL: '${tab.url}' can't be analysed, skipping checklist for this page. Web Dev Checklist does not support URLs like chrome://,  file://, view-source:, "/" and " "`;
            safeInnerHTML(ul, errorImg);
            ul.appendChild(header);
            ul.appendChild(content);
            ul.appendChild(reloadButton());
            document.getElementById("results").appendChild(ul);

            return ul;
        }

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["rules.js"],
            injectImmediately: false,
        });

    } catch (error) {
        // 
    }

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (!hasRun && request.type === "done") {
            hasRun = true;
            const result = request.data;

            Ajax.load(result, updateItem).then(() => {
                createResults(result);
                sendResponse({ status: "completed" });
            });
            return true;
        }
        return false;
    });

    // Open links in new tab/window
    document.body.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
            e.preventDefault();
            window.open(e.target.href);
        }
    });

    function createResults(page) {
        document.getElementById("results").innerText = "";

        for (const cat in page) {
            if (cat === "url" || cat === "currentPage") continue;

            let ul = document.querySelector(`ul[data-cat='${cat}']`) || createHeader(cat);

            for (const item in page[cat]) {
                const li = document.createElement("li");
                li.classList.add(
                    page[cat][item].result === "n/a" ? "question" : page[cat][item].result
                );
                li.setAttribute("data-item", item);

                const elementWrapper = document.createElement("div");
                elementWrapper.className = "elementWrapper";

                const descWrapper = document.createElement("div");
                descWrapper.className = "descWrapper";
                
                elementWrapper.addEventListener("click", () => {
                    const currentLi = elementWrapper.parentNode;

                    const allLi = currentLi.parentNode.querySelectorAll("li.open");
                    allLi.forEach(li => {
                        if (li !== currentLi) li.classList.remove("open");
                    });

                    currentLi.classList.toggle("open");
                });

                const check = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20"><path fill="#54CC56FF" fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16a8 8 0 0 0 0 16m3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79l-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089z" clip-rule="evenodd"/></svg>`;
                const x = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20"><path fill="#FF4E4EFF" fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16a8 8 0 0 0 0 16M8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94z" clip-rule="evenodd"/></svg>`;
                const question = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20"><path fill="#e2dbc5" fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0a8 8 0 0 1 16 0M8.94 6.94a.75.75 0 1 1-1.061-1.061a3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 1 0 8.94 6.94M10 15a1 1 0 1 0 0-2a1 1 0 0 0 0 2" clip-rule="evenodd"/></svg>`;
                const icons = [
                    { svg: check, name: "check" },
                    { svg: x, name: "x" },
                    { svg: question, name: "question" }
                ];

                icons.forEach(({ svg, name }) => {
                    const div = document.createElement("div");
                    safeInnerHTML(div, svg);
                    div.className = `${name}-icon`;
                    descWrapper.appendChild(div);
                });

                const text = document.createElement("p");
                text.innerText = page[cat][item].text;
                descWrapper.appendChild(text);

                const rightArrow = document.createElement("span");
                rightArrow.className = "right-arrow";

                const arrow = `<svg xmlns="http://www.w3.org/2000/svg" class="icon info-color" viewBox="0 0 20 20"><path fill="currentColor" fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10L8.22 6.28a.75.75 0 0 1 0-1.06" clip-rule="evenodd"/></svg>`;
                safeInnerHTML(rightArrow, arrow);
                elementWrapper.appendChild(rightArrow);
                elementWrapper.appendChild(descWrapper);

                li.appendChild(elementWrapper);

                const details = document.createElement("div");
                details.className = "details";

                // Add HTML content if exists
                if (page[cat][item].html) {
                    const detailsInfo = document.createElement("div");
                    detailsInfo.className = "detailsInfo";
                    const parsed = parser.parseFromString(page[cat][item].html, "text/html");
                    detailsInfo.innerHTML = parsed.body.innerHTML;  // Take just the inner content
                    details.appendChild(detailsInfo);
                }

                // Create container for all links
                const linksContainer = document.createElement('div');
                linksContainer.className = 'links-container';

                // Main URL (if exists)
                if (page[cat][item].url && page[cat][item].description) {
                    addLink(linksContainer, page[cat][item].description, page[cat][item].url);
                }

                // Additional URLs (urls1, urls2, etc.) - max 3 total
                let linkCount = page[cat][item].url ? 1 : 0;
                for (let i = 1; i <= 3; i++) {
                    const urlKey = `urls${i}`;
                    if (page[cat][item][urlKey] && 
                        page[cat][item][urlKey].url && 
                        page[cat][item][urlKey].description && 
                        linkCount < 3) {
                        addLink(linksContainer, page[cat][item][urlKey].description, page[cat][item][urlKey].url);
                        linkCount++;
                    }
                }

                // Only add links container if there are links
                if (linksContainer.hasChildNodes()) {
                    details.appendChild(linksContainer);
                }

                li.appendChild(details);
                ul.appendChild(li);
            }
        }


        const reloadWrapper = document.createElement('div');
        reloadWrapper.innerText = "";
        reloadWrapper.classList.add('reload-wrapper');
        reloadWrapper.appendChild(reloadButton());
        document.getElementById("results").appendChild(reloadWrapper);

        reportProgress();
        setTimeout(() => {
            updateExtensionBadge();
        }, 300);
    }

    function createHeader(cat) {
        const ul = document.createElement("ul");
        ul.setAttribute("data-cat", cat);

        const header = document.createElement("li");
        header.classList.add("cat");
        
        // Get appropriate icon based on category
        const icon = getCategoryIcon(cat);
        safeInnerHTML(header, `${icon} <span>${cat}</span>`);

        ul.appendChild(header);
        document.getElementById("results").appendChild(ul);
        return ul;
    }

    function updateExtensionBadge() {
        setTimeout(() => {
            const errors = document.querySelectorAll('.false').length;
            const success = document.querySelectorAll('.true').length;
            const warnings = document.querySelectorAll('.question').length;
            const total = errors + warnings;
            
            chrome.runtime.sendMessage({
                type: "updateBadge",
                count: total,
                success: success,
                errors: errors,
                warnings: warnings
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Badge update failed:', [chrome.runtime.lastError?.message || chrome.runtime.lastError, response]);
                }
            });
        }, 100);
    }

    function getCategoryIcon(category) {
        const icons = {
            "SEO": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M3 9.5a6.5 6.5 0 0 0 6 6.481v1.003A7.5 7.5 0 1 1 16.984 9a2 2 0 0 0-1.717 1H10.5A1.5 1.5 0 0 1 9 8.5V3.019A6.5 6.5 0 0 0 3 9.5M15.981 9A6.5 6.5 0 0 0 10 3.019V8.5a.5.5 0 0 0 .5.5zM16 11a1 1 0 1 1 2 0v7a1 1 0 1 1-2 0zm-6 4a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0zm3-2a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0z"/></svg>`,
            "Mobile": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M7.5 4a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5zM7 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5zM9.5 15a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1zM7 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/></svg>`,
            "Usability": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M7.5 2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5M3.61 3.61a.5.5 0 0 1 .708 0l1.414 1.415a.5.5 0 1 1-.707.707L3.611 4.318a.5.5 0 0 1 0-.707m7.78 0a.5.5 0 0 1 0 .708L9.974 5.732a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0M2 7.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m6.64-.2A1 1 0 0 0 7 8.067v9.101c0 .924 1.145 1.354 1.753.659l2.026-2.316A1.5 1.5 0 0 1 11.908 15h3.211c.935 0 1.359-1.17.64-1.768zM8 17.17V8.067L15.119 14h-3.211a2.5 2.5 0 0 0-1.882.854z"/></svg>`,
            "Accessibility": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M8.5 4.498a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0m1.5-2.5a2.5 2.5 0 0 0-2.43 3.086L5.471 4.15a1.76 1.76 0 0 0-2.317.88c-.4.882-.008 1.917.877 2.31L7 8.662v2.287l-1.877 4.645a1.75 1.75 0 0 0 3.245 1.311l.086-.213a5.5 5.5 0 0 1-.424-1.618l-.589 1.457a.75.75 0 1 1-1.39-.562l1.876-4.645A1 1 0 0 0 8 10.949V8.662a1 1 0 0 0-.593-.914L4.438 6.427a.74.74 0 0 1-.373-.983a.76.76 0 0 1 1-.38l3.918 1.744a2.5 2.5 0 0 0 2.034 0l3.918-1.744a.76.76 0 0 1 1 .38a.74.74 0 0 1-.373.983l-2.969 1.321a1 1 0 0 0-.593.914v.545a5.5 5.5 0 0 1 1-.185v-.36l2.968-1.322a1.74 1.74 0 0 0 .877-2.31a1.76 1.76 0 0 0-2.317-.88l-2.097.934a2.5 2.5 0 0 0-2.43-3.086M18 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0m-2.146-1.854a.5.5 0 0 0-.708 0L12.5 15.293l-.646-.647a.5.5 0 0 0-.708.708l1 1a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0 0-.708"/></svg>`,
            "Social Media": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M5.552 6.488a1.896 1.896 0 0 1 2.68.007l.265.264l.26-.261a1.9 1.9 0 0 1 2.685.007c.742.742.744 1.938.007 2.68l-2.732 2.73a.29.29 0 0 1-.412 0L5.559 9.168a1.896 1.896 0 0 1-.007-2.68M2.038 8.5a6.5 6.5 0 1 1 3.721 5.877l-2.487.697a1 1 0 0 1-1.204-1.32l.796-2.082A6.5 6.5 0 0 1 2.038 8.5m6.5-5.5a5.5 5.5 0 0 0-4.695 8.366l.128.21l-.97 2.535l2.86-.8l.175.088A5.5 5.5 0 1 0 8.538 3M6.574 15.74A6.49 6.49 0 0 0 11.501 18c.993 0 1.936-.223 2.78-.623l2.486.697a1 1 0 0 0 1.204-1.32l-.795-2.082A6.5 6.5 0 0 0 18 11.5c0-1.94-.85-3.682-2.199-4.873a7.5 7.5 0 0 1 .235 1.762c.608.885.964 1.957.964 3.111c0 1.05-.294 2.031-.805 2.866l-.128.21l.97 2.535l-2.86-.8l-.175.088c-.75.384-1.6.601-2.502.601a5.5 5.5 0 0 1-3.167-1.003a7.5 7.5 0 0 1-1.76-.257"/></svg>`,
            "Performance": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M10.986 7.54L10.57 9h1.529a.4.4 0 0 1 .307.656l-2.658 3.19c-.293.35-.856.05-.726-.388L9.455 11H7.9a.4.4 0 0 1-.307-.657l2.668-3.188c.29-.348.85-.051.726.385M8 2.5a.5.5 0 0 0-1 0V4h-.5A2.5 2.5 0 0 0 4 6.5V7H2.5a.5.5 0 0 0 0 1H4v1.5H2.5a.5.5 0 0 0 0 1H4V12H2.5a.5.5 0 0 0 0 1H4v.5A2.5 2.5 0 0 0 6.5 16H7v1.5a.5.5 0 0 0 1 0V16h1.5v1.5a.5.5 0 0 0 1 0V16H12v1.5a.5.5 0 0 0 1 0V16h.5a2.5 2.5 0 0 0 2.5-2.5V13h1.5a.5.5 0 0 0 0-1H16v-1.5h1.5a.5.5 0 0 0 0-1H16V8h1.5a.5.5 0 0 0 0-1H16v-.5A2.5 2.5 0 0 0 13.5 4H13V2.5a.5.5 0 0 0-1 0V4h-1.5V2.5a.5.5 0 0 0-1 0V4H8zM13.5 5A1.5 1.5 0 0 1 15 6.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 13.5v-7A1.5 1.5 0 0 1 6.5 5z"/></svg>`,

        };
        return icons[category] || `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3l5.571-3m-11.142 0L2.25 7.5L12 2.25l9.75 5.25l-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75L2.25 16.5l4.179-2.25m11.142 0l-5.571 3l-5.571-3"/></svg>`;
    }

    function updateItem(key, item) {
        const li = document.querySelector(`li[data-item='${key}']`);
        if (!li) {
            return;
        }

        li.classList.remove("false", "true", "question");
        li.classList.add(item.result === "n/a" ? "question" : item.result);

        const p = li.querySelector("p");
        if (p) {
            p.innerText = "";
            safeInnerHTML(p, item.text);
        }

        const details = li.querySelector(".details");
        if (details) {
            // Clear existing content
            details.innerHTML = '';

            // Create container for all content
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'content-wrapper';

            // Add HTML content if exists
            if (item.html) {
                const detailsInfo = document.createElement("div");
                detailsInfo.className = "detailsInfo";
                detailsInfo.appendChild(
                    parser.parseFromString(item.html, "text/html").body
                );
                contentWrapper.appendChild(detailsInfo);
            }

            // Create container for links
            const linksContainer = document.createElement('div');
            linksContainer.className = 'links-container';

            // Main URL (if exists)
            if (item.url && item.description) {
                addLink(linksContainer, item.description, item.url);
            }

            // Additional URLs (urls1, urls2, etc.) - max 3 total
            let linkCount = item.url ? 1 : 0;
            for (let i = 1; i <= 3; i++) {
                const urlKey = `urls${i}`;
                if (item[urlKey] && item[urlKey].url && item[urlKey].description && linkCount < 3) {
                    addLink(linksContainer, item[urlKey].description, item[urlKey].url);
                    linkCount++;
                }
            }

            // Only add links container if there are links
            if (linksContainer.hasChildNodes()) {
                contentWrapper.appendChild(linksContainer);
            }

            details.appendChild(contentWrapper);
        }

        reportProgress();
    }

    // Helper function to create consistent links
    function addLink(container, text, url) {
        const linkWrapper = document.createElement('div');
        linkWrapper.className = 'link-wrapper';
        
        const a = document.createElement('a');
        a.innerText = text;
        a.href = url;
        
        linkWrapper.appendChild(a);
        container.appendChild(linkWrapper);
    }

    function reloadButton() {
        const button = document.createElement("button");
        button.innerText = "Reload Page";
        button.classList.add("error-button");
        button.addEventListener('click', function (e) {
            e.preventDefault;
            chrome.tabs.reload();
        });
        return button;
    }

    function reportProgress() {
        const fail = document.querySelectorAll(".false").length;
        const success = document.querySelectorAll(".true").length;
        const question = document.querySelectorAll(".question").length;
        const all = fail + success + question;

        const text = document.getElementById("text");

        text.textContent = "";

        text.appendChild(document.createTextNode("Checks passed: "));

        const ok_txt = document.createElement("span");
        ok_txt.classList.add("ok");
        ok_txt.innerText = success;
        text.appendChild(ok_txt);

        text.appendChild(document.createTextNode(" / "));

        const all_txt = document.createElement("span");
        all_txt.classList.add("all");
        all_txt.innerText = all;
        text.appendChild(all_txt);

        // Calculate percentage
        const percent = all > 0 ? (success / all) * 100 : 0;

        // Update progress bar and colors
        const progress = document.getElementById("progress");
        progress.querySelector(".fill").style.width = `${Math.min(percent, 100)}%`;

        // Color and text color based on percent ranges
        let color, text_col;

        if (percent < 20) {
            color = "#ae3232";
            text_col = "#fff";
        } else if (percent < 50) {
            color = "#b56b27";
            text_col = "#fff";
        } else if (percent < 80) {
            color = "#e2dbc5";
            text_col = "#0d1625";
        } else {
            color = "#29992b";
            text_col = "#fff";
        }

        if (percent != 100) {
            progress.querySelector(".fill").style.background = color;
            progress.style.color = text_col;
        }
    }

})();
