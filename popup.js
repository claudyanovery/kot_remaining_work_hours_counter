let no_data_message = document.getElementById('no_data_message');
let date_today = document.getElementById('date_today');
let total_worked_hours_hh = document.getElementById('total_worked_hours_hh');
let total_worked_hours_mm = document.getElementById('total_worked_hours_mm');
let remaining_working_hours_hh = document.getElementById('remaining_working_hours_hh');
let remaining_working_hours_mm = document.getElementById('remaining_working_hours_mm');
let ot_time_hh = document.getElementById('ot_time_hh');
let ot_time_mm = document.getElementById('ot_time_mm');
let total_rest_time_hh = document.getElementById('total_rest_time_hh');
let total_rest_time_mm = document.getElementById('total_rest_time_mm');
let lunch_mins_left = document.getElementById('lunch_mins_left');
let rest_time_warning = document.getElementById('rest_time_warning');


let d = new Date();
// 3600000 ms = 1 hour
var rest_time = 3600000;
// 28800000 ms = 8 hours
var working_hours = 28800000;
var records = {};
let time_now = d.getHours() + ":" + d.getMinutes();
let time_now_with_zero = d.getMinutes() < 10 ? `${d.getHours()} : 0${d.getMinutes()}` : d.getHours() + ":" + d.getMinutes()

function removeChars (text) {
    if (text !== "") {
        var tmp = text.replace(/[C]/g, "");
        return tmp.split(/\s+/).filter((el) => { return el; });
    } else {
        return text;
    }
    
}

function noData() {
    no_data_message.innerHTML = "There are no data for today";
    total_worked_hours_hh.innerHTML = "0"
    total_worked_hours_mm.innerHTML = "0"

    remaining_working_hours_hh.innerHTML = "0"
    remaining_working_hours_mm.innerHTML = "0"

    ot_time_hh.innerHTML = "0"
    ot_time_mm.innerHTML = "0"
    
    total_rest_time_hh.innerHTML = "0"
    total_rest_time_mm.innerHTML = "0"

    lunch_mins_left.innerHTML = "0";
}

function msConverter(time) {
    var msec = time;
    var hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    var mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    var ss = Math.floor(msec / 1000);
    msec -= ss * 1000;

    return {"hh":hh, "mm":mm};
}

function createRecords (data) {
    records["start_time"] = removeChars(data.rawRecords["START_TIMERECORD"]);
    records["end_time"] = removeChars(data.rawRecords["END_TIMERECORD"]);
    records["rest_start"] = removeChars(data.rawRecords["REST_START_TIMERECORD"]);
    records["rest_end"] = removeChars(data.rawRecords["REST_END_TIMERECORD"]);
}

function timeDiff(str_start_time, str_end_time) {
    var start_time = new Date(1996, 10, 23, str_start_time[0], str_start_time[1]);
    var end_time = new Date(1996, 10, 23, str_end_time[0], str_end_time[1]);
    var diff = end_time.getTime() - start_time.getTime();

    return diff;
}

function initialCalculation (records) {
    var working_time = [];
    var rest_time = [];
    for (const record in records) {
        // console.log(`${record}: ${records[record]}`);
        for (var i = 0; i < records[record].length; i++) {
            if (records['start_time'][i] && records['end_time'][i]) {
                working_time[i] = timeDiff(records['start_time'][i].split(":"), records['end_time'][i].split(":"));
            } else if (records['start_time'][i]) {
                working_time[i] = timeDiff(records['start_time'][i].split(":"), time_now.split(":"));
            }

            if (records['rest_start'][i] && records['rest_end'][i]) {
                rest_time[i] = timeDiff(records['rest_start'][i].split(":"), records['rest_end'][i].split(":"));
            } else if (records['rest_start'][i]) {
                rest_time[i] = timeDiff(records['rest_start'][i].split(":"), time_now.split(":"));
            }
        }
    }
    return {working_time, rest_time};
}

function finalCalculation(records) {
    var total_rest_time = 0;
    var total_work_time = 0;
    
    if (records['rest_time'].length > 0) {
        for (var x =0; x < records['rest_time'].length; x++) {
            total_rest_time += records['rest_time'][x];
        }
        var lunch_time = rest_time - total_rest_time;
    }

    if (records['working_time'].length > 0) {
        for (var y =0; y < records['working_time'].length; y++) {
            total_work_time += records['working_time'][y];
        }
    }

    return {total_rest_time, lunch_time, total_work_time}
}

chrome.storage.sync.get(null, (data) => {
    if (data.rawRecords["START_TIMERECORD"] == "" && data.rawRecords["END_TIMERECORD"] == "" && data.rawRecords["REST_START_TIMERECORD"] == "" && data.rawRecords["REST_END_TIMERECORD"] == "") {
        return noData();
    }
    createRecords(data);
    initialCalculation(records);
    var final_records = finalCalculation(initialCalculation(records));

    date_today.innerHTML = `${data.date_today} ${time_now_with_zero}`;

    var total_worked_hours = final_records["total_work_time"] - final_records["total_rest_time"]
    
    var remaining_working_hours = working_hours - total_worked_hours

    total_worked_hours_hh.innerHTML = msConverter(total_worked_hours)["hh"];
    total_worked_hours_mm.innerHTML = msConverter(total_worked_hours)["mm"];

    if (remaining_working_hours <= 0) {
        var total_ot_time = total_worked_hours - working_hours
        ot_time_hh.innerHTML = msConverter(total_ot_time)["hh"];
        ot_time_mm.innerHTML = msConverter(total_ot_time)["mm"];
        remaining_working_hours_hh.innerHTML = "0";
        remaining_working_hours_mm.innerHTML = "0";
    } else {
        remaining_working_hours_hh.innerHTML = msConverter(remaining_working_hours)["hh"];
        remaining_working_hours_mm.innerHTML = msConverter(remaining_working_hours)["mm"];
        ot_time_hh.innerHTML = "0";
        ot_time_mm.innerHTML = "0";
    }

    total_rest_time_hh.innerHTML = msConverter(final_records["total_rest_time"])["hh"];
    total_rest_time_mm.innerHTML = msConverter(final_records["total_rest_time"])["mm"];

    if (final_records["lunch_time"] <= 0) {
        lunch_mins_left.innerHTML = "0";
    } else {
        lunch_mins_left.innerHTML = msConverter(final_records["lunch_time"])["mm"];
        rest_time_warning.innerHTML = "Please make sure to take an hour break";
    }

})
