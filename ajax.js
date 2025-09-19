const Ajax = (function () {
	async function load(page, updateItem) {
		// Robots.txt check
		fetchWithCacheBuster(page.url + "/robots.txt").then((res) => {
			page.SEO.robotstxt.result = res.status === 200;
			updateItem("robotstxt", page.SEO.robotstxt);
		}).catch(() => {
			page.SEO.robotstxt.result = false;
			updateItem("robotstxt", page.SEO.robotstxt);
		});

		// sitemap.txt check
		fetchWithCacheBuster(page.url + "/sitemap.xml").then((res) => {
			page.SEO.sitemaps.result = res.status === 200;
			updateItem("sitemaps", page.SEO.sitemaps);
		}).catch(() => {
			page.SEO.sitemaps.result = false;
			updateItem("sitemaps", page.SEO.sitemaps);
		});

		// llms.txt check
		fetchWithCacheBuster(page.url + "/llms.txt").then((res) => {
			page.SEO.llms.result = res.status === 200;
			updateItem("llms", page.SEO.llms);
		}).catch(() => {
			page.SEO.llms.result = false;
			updateItem("llms", page.SEO.llms);
		});

		// Favicon check if not already present
		if (!page.Usability.favicon.result) {
			fetchWithCacheBuster(page.url + "/favicon.ico").then((res) => {
				if (res.status === 200) {
					page.Usability.favicon.result = true;
					updateItem("favicon", page.Usability.favicon);
				}
			}).catch(() => {
				// 
			});
		}

		// W3C validation check
		if (page.Usability.validator.result === "n/a") {
			await validatePage(page, updateItem);
		}
	}

	// Helper for appending cache buster to URL to avoid caching
	function fetchWithCacheBuster(url) {
		const cacheBustedUrl =
			url + (/\?/.test(url) ? "&" : "?") + "cb=" + new Date().getTime();
		return fetch(cacheBustedUrl, { method: "GET" });
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
				hostname === ""
			);
		} catch (e) {
			return true;
		}
	}

	async function validatePage(page, updateItem) {
		// Handle local files first
		if (isLocalURL(page.currentPage)) {
			page.Usability.validator.result = true;
			page.Usability.validator.text += ": Running Locally";
			updateItem("validator", page.Usability.validator);
			return;
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		const validatorUrl = `https://validator.nu?out=json&level=error&laxtype=yes&doc=${encodeURIComponent(page.currentPage)}`;

		try {
			const response = await fetch(validatorUrl, { signal: controller.signal });

			// Clear the timeout timer if the request completes in time
			clearTimeout(timeoutId);

			// Check for HTTP errors (e.g., 404, 500)
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const json = await response.json();
			const errors = json.messages.length;

			page.Usability.validator.result = errors === 0;
			if (errors > 0) {
				const errorsText = errors === 1 ? "error" : "errors";
				page.Usability.validator.text += `<span class='error'> ${errors} ${errorsText}</span>`;
			}
		} catch (error) {
			page.Usability.validator.result = false;
			if (error.name === 'AbortError') {
				page.Usability.validator.text += "<span class='warn'>Timed out</span>";
			} else {
				page.Usability.validator.text += "<span class='error'>Network Error</span>";
			}
		} finally {
			// This block always runs, ensuring the UI is updated
			updateItem("validator", page.Usability.validator);
		}
	}

	return {
		load,
	};
})();
