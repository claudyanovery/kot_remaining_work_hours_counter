var rawRecords = {};
let jpDay;

const getJapaneseDay = (day) => {
  switch (day) {
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
    default:
      jpDay = "（日）";
      break;
  }
};

let d = new Date();
let day = getJapaneseDay(d.getDay());
let month_now =
  d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : `${d.getMonth() + 1}`;
let date_now = d.getDate() < 10 ? `0${d.getDate()}` : `${d.getDate()}`;
let today = month_now + "/" + date_now + jpDay;

function removeChars(text) {
  var tmp = text.replace(/[C,認,C(携帯),位置(携帯),申]/g, "");
  return tmp.split(/\s+/).filter((el) => {
    return el;
  });
}

document.querySelectorAll("p").forEach((p) => {
  if (removeChars(p.innerText)[0] == today.toString()) {
    p.parentNode.parentNode
      .querySelectorAll(".start_end_timerecord, .rest_timerecord")
      .forEach((record) => {
        rawRecords[record.dataset.htSortIndex] = record.innerText;
      });
  }
});

chrome.runtime.sendMessage(
  { isLoaded: true, rawRecords: rawRecords, date_today: today.toString() },
  (response) => {
    console.log(response);
  }
);
