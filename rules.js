// Function to handle browser API namespace differences
function GetBrowser() {
    try {
        if (browser && browser.runtime) return browser;
    } catch (e) {
        return chrome;
    }
    return chrome;
}
(function() {
    let messages = {};

    async function loadTranslations() {
        try {
            // Get language preference
            const { language } = await chrome.storage.sync.get('language');
            const lang = language || 'en';
            
            // Load messages file
            const messagesUrl = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
            const response = await fetch(messagesUrl);
            const messagesData = await response.json();
            
            messages = Object.fromEntries(
                Object.entries(messagesData).map(([key, value]) => [key, value.message])
            );
        } catch (e) {
            console.error('Failed to load translations:', e);
        }
    }

    // TODO Transform into a live translation or use same approach from localization.js
    function i18n(msg, substitutions = []) {
        try {
            let message = messages[msg] || msg;
            
            // Handle substitutions
            if (substitutions && substitutions.length > 0) {
                substitutions.forEach((sub, index) => {
                    message = message.replace(`$${index + 1}`, sub);
                });
            }
            
            return message;
        } catch (e) {
            console.warn(`Translation failed: ${msg}`, e);
            return msg;
        }
    }

    // Immediately-invoked function expression (IIFE)
    (async function () {
        await loadTranslations();
        
        const OPEN_GRAPH_CHECK = ["title", "type", "image", "url", "description"];
        const TWITTER_X_CHECK = ["title", "card", "image", "description", "site"];
        const stylesheetsCount = document.styleSheets.length;
        let stylesheetCheckCount = 0;
        const domElementsCount = document.getElementsByTagName("*").length;
        const imageAnalysis = getImageSizeAnalysis();
        const keywordsAnalysis = analyzeKeywords();
        const xssAnalysis = checkAndValidateXSS();
        const csrfAnalysis = checkAndValidateCSRF();
        const sslAnalysis = await checkSSL();

        // Main data-gathering function
        function load() {

            const result = {
                url: location.protocol + "//" + location.host,
                currentPage: window.location.href,
                SEO: {
                    microdata: {
                        text: i18n("structuredDataForGoogle"),
                        result: (document.querySelector("[itemscope]") !== null || document.querySelector("script[type='application/ld+json']")) !== null,
                        description: i18n("schemaGeneratorTool"),
                        url: "https://technicalseo.com/tools/schema-markup-generator/",
                        urls1: {
                            description: i18n("schemaMarkupValidator"),
                            url: "https://validator.schema.org/#url=" + encodeURI(window.location.href),
                        },
                        urls2: {
                            description: i18n("richResultsTest"),
                            url: "https://search.google.com/test/rich-results?url=" + encodeURI(window.location.href),
                        },
                        urls3: { // Fixed duplicate urls2 key
                            description: i18n("schemaJsonGeneratorTool"),
                            url: "https://jsonld.com/json-ld-generator/",
                        }
                    },
                    description: {
                        text: i18n("metaDescription"),
                        result: document.querySelector("head>meta[name=description]") !== null,
                        description: i18n("metaDescriptionInfo"),
                        url: "https://moz.com/learn/seo/meta-description",
                    },
                    canonical: {
                        text: i18n("canonicalUrl"),
                        result: document.querySelector("head>link[rel=canonical]") !== null,
                        description: i18n("readMoreHere"),
                        url: "https://moz.com/learn/seo/meta-description",
                    },
                    sitetitle: {
                        text: i18n("websiteTitle"),
                        result: (document.querySelector("head>meta[name=title]") || document.querySelector("head>title")) !== null,
                        description: i18n("readMoreHere"),
                        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata",
                    },
                    keywords: {
                        text: i18n("seoKeywords") + (keywordsAnalysis ?
                            ` (${keywordsAnalysis.charCount} ${i18n("chars")}, ${keywordsAnalysis.wordCount} ${i18n("words")})` :
                            ` (${i18n("tagMissing")})`),
                        result: keywordsAnalysis ? keywordsAnalysis.status : false,
                        description: i18n("readMoreHere"),
                        url: "https://developers.google.com/search/docs/advanced/guidelines/seo-meta-tags",
                        urls1: {
                            description: i18n("keywordResearchTool"),
                            url: "https://ads.google.com/home/tools/keyword-planner/"
                        },
                        urls2: {
                            description: i18n("seoBestPractices"),
                            url: "https://moz.com/learn/seo/meta-keywords"
                        }
                    },
                    robotstxt: {
                        text: i18n("websiteHasRobotsTxt"),
                        result: "n/a",
                        description: i18n("robotsTxtTutorial"),
                        url: "http://tools.seobook.com/robots-txt/",
                        urls1: {
                            description: i18n("freeRobotsTxtGenerator"),
                            url: "https://smallseotools.com/robots-txt-generator/",
                        },
                        urls2: {
                            description: i18n("freeRobotsTxtGenerator2"),
                            url: "https://www.seoptimer.com/robots-txt-generator",
                        },
                    },
                    sitemaps: {
                        text: i18n("websiteHasXmlSitemaps"),
                        result: "n/a",
                        description: i18n("clickHereToLearnMore"),
                        url: "https://www.sitemaps.org/protocol.html",
                        urls1: {
                            description: i18n("generateXmlSitemaps"),
                            url: "https://www.xml-sitemaps.com/?q=" + encodeURI(window.location.href),
                        },
                    },
                    llms: {
                        text: i18n("websiteHasLlmsTxt"),
                        result: "n/a",
                        description: i18n("llmsTxtDescription"),
                        url: "https://llmstxt.org/",
                    },
                },
                Mobile: {
                    mediaqueries: {
                        text: i18n("cssMediaQueries"),
                        result: mediaQueryLocal(),
                        description: i18n("mediaQueriesExplained"),
                        url: "http://cssmediaqueries.com/what-are-css-media-queries.html",
                    },
                    viewport: {
                        text: i18n("viewportMetaTag"),
                        result: document.querySelector("head>meta[name='viewport']") !== null,
                        description: i18n("usingTheViewport"),
                        url: "https://developer.mozilla.org/en-US/docs/Mozilla/Mobile/Viewport_meta_tag",
                    },
                },
                Usability: {
                    favicon: {
                        text: i18n("favicon"),
                        result: (document.querySelector("head>link[rel='icon']") !== null ||
                            document.querySelector("head>link[rel='shortcut icon']") !== null ||
                            document.querySelector("meta[itemprop='image']")) !== null,
                        description: i18n("clickHereToGenerate"),
                        url: "https://realfavicongenerator.net/",
                    },
                    friendlyurls: {
                        text: i18n("useFriendlyUrls"),
                        result: location.href.indexOf("?") === -1,
                        description: i18n("explanationAndGuide"),
                        url: "http://www.techterms.com/definition/friendly_url",
                        urls1: {
                            description: i18n("friendlyUrlChecker"),
                            url: "https://tools.backlinko.com/seo-checker?q=" + encodeURI(window.location.href),
                        },
                    },
                    validator: {
                        text: i18n("htmlValidation"),
                        result: "n/a",
                        description: i18n("onlineValidator"),
                        url: "http://validator.nu/?doc=" + encodeURIComponent(window.location.href),
                    },
                },
                "Accessibility": {
                    landmarks: {
                        text: i18n("waiAriaLandmarks"),
                        result: document.querySelector("[role], main, footer, header, aside, section, article, nav") !== null,
                        description: i18n("usingLandmarks"),
                        url: "http://accessibility.oit.ncsu.edu/blog/2011/06/30/using-aria-landmarks-a-demonstration/",
                    },
                    alt: {
                        text: i18n("altAttributes"),
                        result: document.querySelector("img:not([alt])") === null,
                        description: i18n("imageAltAttributeTips"),
                        url: "http://accessibility.psu.edu/images",
                    },
                },
                Security: {
                    xss: {
                        text: i18n("xssVulnerabilities") + `"${xssAnalysis.vulnerabilityCount}" ${xssAnalysis.hasVulnerabilities ? i18n("detected") : i18n("notFound")}`,
                        result: !xssAnalysis.hasVulnerabilities,
                        description: i18n("getXssCheatSheet"),
                        url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
                        urls1: {
                            description: i18n("domXssCheatSheet"),
                            url: "https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html"
                        },
                        urls2: {
                            description: i18n("xssFilterEvasion"),
                            url: "https://owasp.org/www-community/xss-filter-evasion-cheatsheet"
                        }
                    },
                    csrf: {
                        text: i18n("csrfProtection") + `"${csrfAnalysis.vulnerabilityCount}" ${csrfAnalysis.isProtected ? i18n("detected") : i18n("vulnerable")}`,
                        result: csrfAnalysis.isProtected,
                        description: i18n("csrfCheatSheet"),
                        url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
                        urls1: {
                            description: i18n("csrfProtectionGuide"),
                            url: "https://portswigger.net/web-security/csrf"
                        },
                        urls2: {
                            description: i18n("csrfTestingMethodology"),
                            url: "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/05-Testing_for_Cross-Site_Request_Forgery"
                        }
                    },
                    ssl: {
                        text: i18n("siteUrlHas") + `${sslAnalysis.isSecure ? i18n("valid") : i18n("invalid")} ${i18n("certificate")} - (${sslAnalysis.message.split(' - ')[0]})`,
                        result: sslAnalysis.isSecure,
                        description: i18n("getFreeSslCertificate"),
                        url: "https://letsencrypt.org/",
                        urls1: {
                            description: i18n("learnMoreAboutSsl"),
                            url: "https://www.cloudflare.com/learning/ssl/what-is-ssl/"
                        },
                        urls2: {
                            description: i18n("testYourDomain"),
                            url: `https://www.ssllabs.com/ssltest/analyze.html?d=${encodeURIComponent(window.location.hostname)}`
                        },
                    },
                },
                "Social Media": {
                    opengraph: {
                        text: i18n("openGraph"),
                        result: getOpenGraphResult(OPEN_GRAPH_CHECK),
                        html: getOpenGraphResultHtml(OPEN_GRAPH_CHECK),
                        description: i18n("openGraphProtocolReference"),
                        url: "http://ogp.me/",
                    },
                    twitterx: {
                        text: i18n("twitterCards"),
                        result: getTwitterXResult(TWITTER_X_CHECK),
                        html: getTwitterXResultHtml(TWITTER_X_CHECK),
                        description: i18n("readMoreAtXDeveloperPage"),
                        url: "https://developer.x.com/en/docs/x-for-websites/cards/overview/abouts-cards",
                    },
                    ios: {
                        text: i18n("appleIos"),
                        result: document.querySelector("link[rel^='apple-']") !== null,
                        description: i18n("iosIntegration"),
                        url: "http://developer.apple.com/library/ios/#documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html",
                    },
                },
                Performance: {
                    elements: {
                        text: i18n("numberOfDomElements") + `(${domElementsCount})`,
                        result: domElementsCount < 2000,
                        description: i18n("clickHereToLearnMore"),
                        url: "https://developer.chrome.com/docs/lighthouse/performance/dom-size",
                        urls1: {
                            description: i18n("checkThisLinkAlso"),
                            url: "https://sitechecker.pro/site-audit-issues/avoid-excessive-dom-size/",
                        },
                        urls2: {
                            description: i18n("visitWebDevToKnowMore"),
                            url: "https://web.dev/articles/dom-size-and-interactivity",
                        }
                    },
                    optimizeimages: {
                        text: i18n("bloatedImages") + `(${imageAnalysis.message})`,
                        result: imageAnalysis.oversizedCount === 0,
                        description: i18n("clickHereToViewPageInsites"),
                        url: "https://pagespeed.web.dev/analysis?url=" + encodeURIComponent(window.location.href),
                        urls1: {
                            description: i18n("optimizeYourImagesHere"),
                            url: "https://imagecompressor.com/",
                        },
                        urls2: {
                            description: i18n("wantMoreTryThis"),
                            url: "https://squoosh.app/",
                        }
                    }
                },
            };

            // If local media queries are not found, check remote stylesheets (async)
            if (!result.Mobile.mediaqueries.result) {
                mediaQueryRemote((state) => {
                    result.Mobile.mediaqueries.result = state;

                    // Send final result after remote media queries check
                    GetBrowser().runtime.sendMessage(
                        { type: "result", data: result },
                        () => { }
                    );
                });
            } else {
                // Send immediately if media queries found locally
                GetBrowser().runtime.sendMessage(
                    { type: "result", data: result },
                    () => { }
                );
            }
        }

        function analyzeKeywords() {
            const metaKeywords = document.querySelector("head>meta[name=keywords]");
            if (!metaKeywords) return null;

            const keywordsContent = metaKeywords.getAttribute("content") || "";
            const charCount = keywordsContent.length;
            const keywordsList = keywordsContent.split(',').filter(k => k.trim());
            const wordCount = keywordsList.length;

            // SEO best practices thresholds
            const MIN_CHARS = 10;
            const MAX_CHARS = 255;
            const MAX_WORDS = 20;

            let status = true;
            let details = [];

            if (charCount < MIN_CHARS) {
                status = false;
                details.push(`Too short (${charCount}/10+ chars)`);
            }
            if (charCount > MAX_CHARS) {
                status = false;
                details.push(`Too long (${charCount}/255 max)`);
            }
            if (wordCount > MAX_WORDS) {
                status = false;
                details.push(`Too many keywords (${wordCount}/20 max)`);
            }

            return {
                exists: true,
                status: status,
                content: keywordsContent,
                charCount: charCount,
                wordCount: wordCount,
                keywords: keywordsList,
                details: details.join(', ')
            };
        }

        function formatSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            let units = ['KB', 'MB', 'GB'];
            let i = -1;
            let size = bytes;
            do {
                size /= 1024;
                i++;
            } while (size > 1024 && i < units.length - 1);
            return size.toFixed(1) + ' ' + units[i];
        }

        function getImageSizeAnalysis(thresholdKB = 100) {
            const resources = window.performance.getEntriesByType('resource');
            const images = resources.filter(r => r.initiatorType === 'img');
            let totalOversizedBytes = 0;
            let oversizedCount = 0;

            images.forEach(img => {
                if (img.transferSize > thresholdKB * 1024) {
                totalOversizedBytes += img.transferSize;
                oversizedCount++;
                }
            });

            return {
                totalOversized: formatSize(totalOversizedBytes),
                oversizedCount,
                message: `${oversizedCount} image(s) exceeds recommended size: ${thresholdKB}KB totaling: ${formatSize(totalOversizedBytes)}`
            };
        }

        // Check all required OpenGraph meta properties exist
        function getOpenGraphResult(toCheck) {
            for (let i = 0; i < toCheck.length; i++) {
                if (document.querySelector(`meta[property='og:${toCheck[i]}']`) === null) {
                    return false;
                }
            }
            return true;
        }

        // Generate HTML with pass/fail classes per OpenGraph property
        function getOpenGraphResultHtml(toCheck) {
            let result = "";

            toCheck.forEach((item) => {
                const pass = document.querySelector(`meta[property='og:${item}']`) !== null;
                result += `<div class="${pass ? "graph-pass" : "graph-error"}"><span>${item}</span></div>`;
            });

            return `<div class="graph-info">${result}</div>`;
        }

        // Check all required TwitterX meta properties exist
        function getTwitterXResult(toCheck) {
            for (let i = 0; i < toCheck.length; i++) {
                if (document.querySelector(`meta[name='twitter:${toCheck[i]}']`) === null) {
                    return false;
                }
            }
            return true;
        }

        // Generate HTML with pass/fail classes per TwitterX name
        function getTwitterXResultHtml(toCheck) {
            let result = "";

            toCheck.forEach((item) => {
                const pass = document.querySelector(`meta[name='twitter:${item}']`) !== null;
                result += `<div class="${pass ? "graph-pass" : "graph-error"}"><span>${item}</span></div>`;
            });

            return `<div class="graph-info">${result}</div>`;
        }

        // Detect locally-defined media queries within <style> and <link> elements
        function mediaQueryLocal() {
            const styles = document.querySelectorAll("style");

            for (let s = 0; s < styles.length; s++) {
                if (styles[s].textContent.includes("@media")) {
                    return true;
                }
            }

            const links = document.querySelectorAll("link[media]");

            for (let i = 0; i < links.length; i++) {
                const mediaAttr = links[i].getAttribute("media");
                if (
                    mediaAttr !== "print" &&
                    mediaAttr !== "screen" &&
                    mediaAttr !== "handheld" &&
                    mediaAttr !== "aural" &&
                    mediaAttr !== "projection" &&
                    mediaAttr !== "tv" &&
                    mediaAttr !== "braille"
                ) {
                    return true;
                }
            }

            try {
                for (let s = 0; s < document.styleSheets.length; s++) {
                    const cssSheet = document.styleSheets[s];
                    if (!cssSheet.cssRules) continue;
                    for (let r = 0; r < cssSheet.cssRules.length; r++) {
                        const rule = cssSheet.cssRules[r];
                        if (rule.type === CSSRule.MEDIA_RULE) {
                            return true;
                        }
                    }
                }
            } catch (ex) {
                return false;
            }

            return false;
        }

        function mediaQueryRemote(callback) {
            if (stylesheetsCount === 0) {
                callback(false);
                return;
            }

            let completedCount = 0;
            let foundMediaQuery = false;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                callback(false);
            }, 3000);

            const cssSheets = Array.from(document.styleSheets)
                .filter(sheet => sheet.href && 
                        (sheet.href.startsWith("http://") || sheet.href.startsWith("https://")));

            if (cssSheets.length === 0) {
                callback(false);
                return;
            }

            // Process all CSS sheets in parallel
            Promise.allSettled(cssSheets.map(sheet => 
                checkSheetForMediaQueries(sheet.href, controller.signal)
            )).then(results => {
                clearTimeout(timeoutId);
                const hasMediaQuery = results.some(result => 
                    result.status === 'fulfilled' && result.value
                );
                callback(hasMediaQuery);
            });

            async function checkSheetForMediaQueries(url, signal) {
                if (foundMediaQuery) return false;
                
                // Check cache first
                const cached = sessionStorage.getItem(`media-query-${url}`);
                if (cached !== null) {
                    return cached === 'true';
                }

                try {
                    // First check if it's a CSS file with HEAD request
                    const headResponse = await fetch(url, { 
                        method: 'HEAD',
                        signal,
                        cache: 'force-cache'
                    });
                    
                    if (!headResponse.ok) return false;
                    
                    const contentType = headResponse.headers.get('content-type');
                    if (!contentType || !contentType.includes('text/css')) {
                        return false;
                    }

                    // If it's CSS, fetch the content
                    const response = await fetch(url, { 
                        signal,
                        cache: 'force-cache'
                    });
                    
                    if (!response.ok) return false;
                    
                    const text = await response.text();
                    const hasMedia = text.includes("@media");
                    
                    // Cache the result
                    sessionStorage.setItem(`media-query-${url}`, hasMedia ? 'true' : 'false');
                    
                    return hasMedia;
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.warn(`Failed to check ${url}:`, error);
                    }
                    return false;
                }
            }
        }

        function checkAndValidateXSS() {
            const xssVulnerabilities = {
                // unescapedOutput: checkUnescapedOutput(),
                // dangerousAttributes: checkDangerousAttributes(),
                inlineEventHandlers: checkInlineEventHandlers(),
                scriptSrcUrls: checkScriptSrcUrls(),
                // domXssSinks: checkDomXssSinks()
            };

            const vulnerabilityCount = Object.values(xssVulnerabilities).filter(Boolean).length;

            return {
                hasVulnerabilities: vulnerabilityCount > 0,
                vulnerabilityCount,
                details: xssVulnerabilities
            };
        }

        function checkInlineEventHandlers() {
            return document.querySelectorAll('[onclick], [onmouseover], [onload], [onerror]').length > 0;
        }

        function checkScriptSrcUrls() {
            const scripts = document.querySelectorAll('script[src]');
            return Array.from(scripts).some(script => {
                const src = script.getAttribute('src') || '';
                return src.includes('javascript:') || src.includes('data:');
            });
        }

        function checkAndValidateCSRF() {
            const csrfAnalysis = {
                hasAntiCsrfToken: checkAntiCsrfTokens(),
                // hasSameSiteCookies: checkSameSiteCookies(),
                // hasUnprotectedForms: checkUnprotectedForms(),
                hasStateChangingGetRequests: checkStateChangingGetRequests()
            };

            const vulnerabilityCount = Object.values(csrfAnalysis).filter(vuln => !vuln).length;

            return {
                isProtected: vulnerabilityCount === 0,
                vulnerabilityCount,
                details: csrfAnalysis
            };
        }

        function checkAntiCsrfTokens() {
            const forms = document.querySelectorAll('form');
            if (forms.length === 0) return true;

            // Pre-compile regex patterns for better performance
            const csrfPatterns = [
                /^(csrf[-_]?token|authenticity_token|csrfmiddlewaretoken|_token|__requestverificationtoken|securitytoken|antiforgerytoken|ftoken|form[-_]?token|state|nonce)$/i,
                /^_[a-z0-9]+_token$/i,
                /^[a-z0-9_-]*(csrf|token|secure|auth|validation)[a-z0-9_-]*$/i
            ];

            const excludePatterns = [
                /^(api[-_]?key|access[-_]?token|bearer[-_]?token|oauth[-_]?token|jwt|session[-_]?id|auth[-_]?token|id[-_]?token)$/i
            ];

            const metaPatterns = new Set([
                'csrf-token', 'xsrf-token', 'csrf-param', 'authenticity-token',
                'csrf_token', '__requestverificationtoken', 'anti-forgery-token',
                'wordpress_nonce', 'joomla_token', 'django_csrftoken', 'authenticity_token',
                'request-verification-token', 'form_token', 'csrftoken', 'csrfparam', 'xsrf'
            ]);

            // Check forms first (most common place for CSRF tokens)
            for (const form of forms) {
                const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
                
                for (const input of hiddenInputs) {
                    const inputName = input.getAttribute('name');
                    if (!inputName) continue;

                    // Skip excluded patterns first (cheaper check)
                    if (excludePatterns.some(pattern => pattern.test(inputName))) {
                        continue;
                    }

                    // Check CSRF patterns
                    if (csrfPatterns.some(pattern => pattern.test(inputName))) {
                        const value = input.value;
                        // Simplified validation - CSRF tokens are typically not empty
                        if (value && value.length >= 8) {
                            return true; // Early return when found
                        }
                    }
                }
            }

            // Check meta tags
            const metas = document.querySelectorAll('meta[name]');
            for (const meta of metas) {
                const name = meta.getAttribute('name');
                if (name && metaPatterns.has(name.toLowerCase()) && meta.getAttribute('content')) {
                    return true; // Early return when found
                }
            }

            // Check cookies (fast check)
            if (document.cookie && (
                /(X[-_])?CSRF[-_]?Token=/i.test(document.cookie) ||
                /XSRF[-_]?TOKEN=/i.test(document.cookie) ||
                /X[-_]?Requested[-_]?With=/i.test(document.cookie)
            )) {
                return true;
            }

            // Check window properties (very fast check)
            if (window.__CSRF_TOKEN__ !== undefined || 
                window.csrfToken !== undefined ||
                window.XSRF_TOKEN !== undefined) {
                return true;
            }

            // Check HTTP headers (last resort - more expensive)
            if (typeof XMLHttpRequest !== 'undefined') {
                // Create a test request instead of monkey-patching
                try {
                    const testXhr = new XMLHttpRequest();
                    testXhr.open('GET', window.location.href, false); // Synchronous for simplicity
                    testXhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    testXhr.send();
                    
                    const headers = testXhr.getAllResponseHeaders().toLowerCase();
                    if (headers.includes('x-csrf-token') || headers.includes('xsrf-token')) {
                        return true;
                    }
                } catch (e) {
                    // Silent fail - headers might not be accessible
                }
            }

            return false;
        }

        function checkStateChangingGetRequests() {
            const getForms = document.querySelectorAll('form[method="GET"]');
            return getForms.length === 0;
        }

        async function checkSSL() {
            // First check if we're running locally
            if (isLocalURL(window.location.href)) {
                return {
                    isSecure: true,
                    expired: null,
                    message: "Running locally - SSL not applicable",
                    local: true
                };
            }

            // For non-local URLs, proceed with SSL checks
            try {
                const isSecure = window.location.protocol === 'https:';
                if (!isSecure) {
                    return {
                        isSecure: false,
                        expired: null,
                        message: "Not using HTTPS",
                        local: false
                    };
                }

                // Only check SSL details for HTTPS sites
                const domain = window.location.hostname.replace('www.', '');
                const response = await chrome.runtime.sendMessage({
                    type: "checkSSL",
                    domain: domain
                });

                if (!response?.success) {
                    throw new Error(response?.error || "API request failed");
                }

                const certData = response.data?.result || {};
                const isValid = certData.cert_valid === true;
                const isExpired = certData.cert_exp === true;

                return {
                    isSecure: isValid,
                    expired: isExpired,
                    expiryDate: certData.valid_till || null,
                    issuer: certData.issuer_o || certData.issuer_cn || "Unknown",
                    message: isExpired ? 
                        `⚠️ Expired on ${certData.valid_till}` : 
                        `Valid until ${certData.valid_till || 'unknown'}`,
                    local: false
                };

            } catch (error) {
                return {
                    isSecure: false,
                    expired: null,
                    message: "Check failed - " + (error.message || "Unknown error"),
                    local: false
                };
            }
        }

        function isLocalURL(url) {
            try {
                const u = new URL(url);
                const hostname = u.hostname.toLowerCase();

                // Match localhost, 127.x.x.x and common private IPs, file protocol
                return (
                    u.protocol === "file:" ||
                    hostname === "localhost" ||
                    hostname === "127.0.0.1" ||
                    hostname.startsWith("192.168.") ||
                    hostname.startsWith("10.") ||
                    hostname.startsWith("172.16.") ||
                    hostname === "" ||
                    // Also match .localhost TLD and common dev domains
                    hostname.endsWith('.localhost') ||
                    hostname.endsWith('.local') ||
                    hostname.endsWith('.test') ||
                    hostname.endsWith('.example') ||
                    // Match any IP address in private ranges
                    isPrivateIP(hostname)
                );
            } catch (e) {
                return true; // Assume local if URL parsing fails
            }
        }

        function isPrivateIP(hostname) {
            // Check if hostname is an IP address and in private range
            const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
            if (!ipRegex.test(hostname)) return false;
            
            const parts = hostname.split('.').map(Number);
            
            // Check private IP ranges:
            // 10.0.0.0 - 10.255.255.255
            if (parts[0] === 10) return true;
            
            // 172.16.0.0 - 172.31.255.255
            if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
            
            // 192.168.0.0 - 192.168.255.255
            if (parts[0] === 192 && parts[1] === 168) return true;
            
            // 127.0.0.0 - 127.255.255.255 (loopback)
            if (parts[0] === 127) return true;
            
            // 169.254.0.0 - 169.254.255.255 (link-local)
            if (parts[0] === 169 && parts[1] === 254) return true;
            
            return false;
        }

        load();
    })();
})();
