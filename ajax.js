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
			const xhr = new XMLHttpRequest();
			xhr.open(
				"GET",
				"https://validator.nu?out=json&level=error&laxtype=yes&doc=" +
				encodeURIComponent(page.currentPage),
				true
			);
			xhr.setRequestHeader("Content-type", "text/html");

			xhr.onload = function () {
				if (xhr.readyState === 4 && xhr.status === 200) {
					const json = JSON.parse(xhr.responseText);
					const errors = json.messages.length;

					page.Usability.validator.result = errors === 0;

					if (errors > 0) {
						let errorsText = errors === 1 ? "error" : "errors";
						page.Usability.validator.text +=
							"<span class='error'> " + errors + " " + errorsText + "</span>";
					}

					updateItem("validator", page.Usability.validator);
				}
			};
			xhr.send();
		}
	}

	// Helper for appending cache buster to URL to avoid caching
	function fetchWithCacheBuster(url) {
		const cacheBustedUrl =
			url + (/\?/.test(url) ? "&" : "?") + "cb=" + new Date().getTime();
		return fetch(cacheBustedUrl, { method: "GET" });
	}

	return {
		load,
	};
})();
