(async () => {
	let tilesconfig = await (await fetch("https://rotstudio.com.br:8000/config.json", {cache: 'no-cache'})).json();

	fetch = new Proxy(fetch, {
		apply: (target, thisArg, argList) => {
			console.log(target, thisArg, argList);
			if (!argList[0]) {
				throw new Error("No URL provided to fetch");
			}

			const urlString = typeof argList[0] === "object" ? argList[0].url : argList[0];
			let url;

			try {
				url = new URL(urlString);
			} catch (e) {
				throw new Error("Invalid URL provided to fetch");
			}
			if (url.pathname != "/config.json") {
				var match = false;
				for (const configentry of tilesconfig) {
					if (url.pathname == "/files/s0/tiles/" + configentry[0] + "/" + configentry[1] + ".png") {
						match = true;
						break;
					}
				}

				if (url.hostname === "backend.wplace.live" && match) {
					url.host = "rotstudio.com.br:8000";
					url.protocol = "https";
					console.log("Modified URL:", url);

					if (typeof argList[0] === "object") {
						argList[0] = new Request(url, argList[0]);
					} else {
						argList[0] = url.toString();
					}
				}
			}
			return target.apply(thisArg, argList);
		}
	});
})();
