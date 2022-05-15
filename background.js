
// Register handler for when the Readup extension Icon gets clicked.
//
// Action taken: open the Readup POC page with the requested URL as a query param
// in the current tab.
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.update({
        url: `https://web.thorgalle.me/readup-poc/?url=${encodeURIComponent(tab.url)}`
    })
    // Note: doing this and accessing the URL requires the "tabs" permission
    // https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab
});

// Allowed origins for web page <-> extension communication.
const allowedOriginRegex = /https:\/\/web\.thorgalle\.me\/readup-poc\//

// Register handler for messages from the Readup POC page
//
// Action taken: send back HTML text (requested with cookies) for the requested URL
chrome.runtime.onMessageExternal.addListener(
    async function (request, sender, sendResponse) {
        console.log(`Received request from ${sender.url} `);
        if (!allowedOriginRegex.test(sender.url)) {
            console.warn(`${sender.url} not allowed to request data.`)
            return;  // don't allow this web page access
        }
        if (request.getHTMLFor) {
            const htmlString = await getArticleHTMLForURL(request.getHTMLFor, request.withCredentials);
            console.log(htmlString.substring(1, 300))
            sendResponse(htmlString);
        }
        // to indicate that sendResponse will be called async, 
        // return true or a promise
        return true;
    }
);

async function getArticleHTMLForURL(url, withCredentials = true) {
    console.log("Fetching URL: ", url);
    return fetch(url, {
        credentials: withCredentials ? "include" : "omit",
        method: "GET",
        mode: "cors",
    })
        .catch(e => console.error("Requesting article page failed ", e))
        .then(r => r.text())
        .catch(e => console.error("HTTP response parsing failed ", e))
}

