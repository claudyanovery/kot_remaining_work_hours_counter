chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 's2.kingtime.jp'},
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(sender.tab? "from a content script:" +sender.tab.url : "from the extension");
    if (request.isLoaded == true) {
        chrome.storage.sync.set({'rawRecords': request.rawRecords, 'date_today': request.date_today}, () => {
            console.log(request.rawRecords);
            console.log(request.date_today);
        })
        sendResponse({isReceived: true});
    }
})