
let jpDay;
const getJapaneseDay = (date) => {
    switch(date) {
        case 1:
            jpDay = "（月）";
            break;
        case 2:
            jpDay = "（火）";
            break;
        case 3:
            jpDay = "（水）";
            break;
        case 4:
            jpDay = "（木）";
            break;
        case 5:
            jpDay = "（金）";
            break;
        case 6:
            jpDay = "（土）";
            break;
        case 7:
            jpDay = "（日）";
            break;
    }
};

let d = new Date();
let day = getJapaneseDay(d.getDay());
let month_now = (d.getMonth() + 1) < 10 ? `0${d.getMonth() + 1}` : `${d.getMonth() + 1}`;
let date_now = d.getDate() < 10 ? `0${d.getDate()}` : `${d.getDate()}`;
let today = month_now + "/" + date_now + jpDay;

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({date_today: today.toString()}, function() {
        console.log("Today is " + today.toString());
    });

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
        chrome.storage.sync.set({'rawRecords': request.rawRecords}, () => {
            console.log(request.rawRecords);
        })
        sendResponse({isReceived: true});
    }
})