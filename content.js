var rawRecords = {};

function removeChars (text) {
    var tmp = text.replace(/[C]/g, "");
    return tmp.split(/\s+/).filter((el) => { return el; })
}
chrome.storage.sync.get('date_today', (data) => {
    document.querySelectorAll("p").forEach((p) => {
        if (removeChars(p.innerText)[0] == data.date_today) {
            
            p.parentNode.parentNode.querySelectorAll(".start_end_timerecord, .rest_timerecord").forEach((record) => {
                rawRecords[record.dataset.htSortIndex] = record.innerText;
            })
            console.log(rawRecords);
            chrome.runtime.sendMessage({isLoaded: true, rawRecords: rawRecords}, (response) => {
                console.log(response);
            })
        }
    })
})

