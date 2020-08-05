let Func = require('./Func');

module.exports = class Period extends Func {

    constructor() {
        super();
    }

    trimMonthArray() {
        let months = [];
        for (let i = 0; i < this.months.length; i++) {
            months.push(this.months[i].slice(0, 3));
        }
        return months;
    }

    getYears(count = 5) {
        let year = new Date().getYear() + 1900;
        let fetched = [];
        for (let i = 0; i < count; i++) {
            fetched.push(`${year - 1}-${year}`);
            year++;
        }
        return fetched;
    }

    isTimeValid(time) {
        time = time.split(':');
        if (time.length == 2 || time.length == 3) {
            var hour = new Number(time[0]);
            var minutes = new Number(time[1]);
            var seconds = 0;
            var total = 0;

            if (time.length == 3) {
                seconds = new Number(time[2]);
                if (hour > 23 || hour < 0 || minutes > 59 || minutes < 0 || seconds > 59 || seconds < 0) {
                    return false;
                }
            } else {
                if (hour > 23 || hour < 0 || minutes > 59 || minutes < 0) {
                    return false;
                }
            }

            var total = (hour * 60 * 60) + (minutes * 60) + seconds;
            return total;
        }
        return false;
    }

    time(time) {
        let date = (this.isset(time)) ? new Date(Math.floor(time)) : new Date();
        let hour = date.getHours().toString();
        let minutes = date.getMinutes().toString();
        let seconds = date.getSeconds().toString();

        hour = (hour.length > 1) ? hour : `0${hour}`;
        minutes = (minutes.length > 1) ? minutes : `0${minutes}`;
        seconds = (seconds.length > 1) ? seconds : `0${seconds}`;

        return `${hour}:${minutes}:${seconds}`;
    }

    date(time) {
        let date = (this.isset(time)) ? new Date(Math.floor(time)) : new Date();
        let day = date.getDate().toString();
        let month = (date.getMonth() + 1).toString();
        let year = date.getFullYear().toString();

        day = (day.length > 1) ? day : `0${day}`;
        month = (month.length > 1) ? month : `0${month}`;

        return `${year}-${month}-${day}`;
    }

    time_date(time) {
        return `${this.time(time)}, ${this.date(time)}`;
    }

    timeToday() {
        let date = new Date();
        let hour = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        let time = this.isTimeValid(`${hour}:${minutes}:${seconds}`);
        return time ? time : -1;
    }

    isDateValid(value) {
        if (this.isDate(value)) {
            if (this.isYearValid(value)) {
                if (this.isMonthValid(value)) {
                    if (this.isDayValid(value)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isDayValid(value) {
        var v_day = "";
        for (var i = 0; i < 2; i++) {
            v_day += value[i + 8];
        }
        var limit = 0;
        var month = this.isMonthValid(value);

        if (month == '01') {
            limit = 31;
        } else if (month == '02') {
            if (this.isLeapYear(this.isYearValid(value))) {
                limit = 29;
            } else {
                limit = 28;
            }
        } else if (month == '03') {
            limit = 31;
        } else if (month == '04') {
            limit = 30;
        } else if (month == '05') {
            limit = 31;
        } else if (month == '06') {
            limit = 30;
        } else if (month == '07') {
            limit = 31;
        } else if (month == '08') {
            limit = 31;
        } else if (month == '09') {
            limit = 30;
        } else if (month == '10') {
            limit = 31;
        } else if (month == '11') {
            limit = 30;
        } else if (month == '12') {
            limit = 31;
        }

        if (limit < v_day) {
            return 0;
        }
        return v_day;
    }

    isDate(value) {
        var len = value.length;
        if (len == 10) {
            for (var x in value) {
                if (this.isDigit(value[x])) {
                    continue;
                } else {
                    if (x == 4 || x == 7) {
                        if (value[x] == '-') {
                            continue;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }
        } else {
            return false;
        }
        return true;
    }

    isMonthValid(value) {
        var v_month = "";
        for (var i = 0; i < 2; i++) {
            v_month += value[i + 5];
        }
        if (v_month > 12 || v_month < 1) {
            return 0;
        }
        return v_month;
    }

    isYearValid(value) {
        var year = new Date().getFullYear('Y');
        var v_year = "";
        for (var i = 0; i < 4; i++) {
            v_year += value[i + 0];
        }
        if (v_year > year) {
            return 0;
        }
        return v_year;
    }

    getYear(value) {
        var v_year = "";
        for (var i = 0; i < 4; i++) {
            v_year += value[i + 0];
        }
        return v_year;
    }

    isLeapYear(value) {
        if (value % 4 == 0) {
            if ((value % 100 == 0) && (value % 400 != 0)) {
                return false;
            }
            return true;
        }
        return false;
    }

    daysInMonth(month, year) {
        var days = 0;
        if (month == '01') {
            days = 31;
        } else if (month == '02') {
            if (this.isLeapYear(year)) {
                days = 29;
            } else {
                days = 28;
            }
        } else if (month == '03') {
            days = 31;
        } else if (month == '04') {
            days = 30;
        } else if (month == '05') {
            days = 31;
        } else if (month == '06') {
            days = 30;
        } else if (month == '07') {
            days = 31;
        } else if (month == '08') {
            days = 31;
        } else if (month == '09') {
            days = 30;
        } else if (month == '10') {
            days = 31;
        } else if (month == '11') {
            days = 30;
        } else if (month == '12') {
            days = 31;
        }
        return days;
    }

    dateValue(date) {
        var value = 0;
        var year = this.getYear(date) * 365;
        var month = 0;
        for (var i = 1; i < this.isMonthValid(date); i++) {
            month = this.daysInMonth(i, this.getYear(date)) / 1 + month / 1;
        }
        var day = this.isDayValid(date);
        value = (year / 1) + (month / 1) + (day / 1);

        return value;
    }

    today() {
        var today = new Date;
        var month = today.getMonth() / 1 + 1;
        if (month.length != 2) {
            month = '0' + month;
        }
        today = (today.getFullYear()) + '-' + month + '-' + today.getDate();
        return today;
    }

    getDateObject(value) {
        let days = Math.floor(value / this.secondsInDays(1));

        value -= this.secondsInDays(days);

        let hours = Math.floor(value / this.secondsInHours(1));
        value -= this.secondsInHours(hours);

        let minutes = Math.floor(value / this.secondsInMinutes(1));
        value -= this.secondsInMinutes(minutes);

        let seconds = value;

        return { days, hours, minutes, seconds };
    }

    dateWithToday(date) {
        var today = Math.floor(this.dateValue(this.today()));
        let dateValue = Math.floor(this.dateValue(date));

        var value = { diff: (dateValue - today), when: '' };
        if (dateValue > today) {
            value.when = 'future';
        }
        else if (dateValue == today) {
            value.when = 'today';
        }
        else {
            value.when = 'past';
        }
        return value;
    }

    dateString(date) {
        var year = new Number(this.getYear(date));
        var month = new Number(this.isMonthValid(date));
        var day = new Number(this.isDayValid(date));

        return day + ' ' + this.months[month - 1] + ', ' + year;
    }

    secondsInDays(days) {
        let value = Math.floor(days * 24 * 60 * 60);
        return value;
    }

    secondsInHours(hours) {
        return Math.floor(hours * 60 * 60);
    }

    secondsInMinutes(minutes) {
        return Math.floor(minutes * 60);
    }

    secondsTillDate(date) {
        return this.secondsInDays(Math.floor(this.dateValue(date)));
    }

    secondsTillToday() {
        return this.secondsTillDate(this.today());
    }

    secondsTillNow() {
        return this.secondsTillDate(this.today()) + this.timeToday();
    }

    secondsTillMoment(moment) {
        return this.secondsTillDate(this.date(moment)) + this.isTimeValid(this.time(moment));
    }
}