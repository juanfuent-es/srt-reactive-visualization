// @credits: https://github.com/fuermosi777/srtjs/blob/master/dist/built.js

export default class Srt {
    constructor(_string = "") {
        this.srtContent = _string
        this.lines = []
        this.parse()
    }

    parse() {
        let lines = this.srtContent.split('\n\r\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let origin = line.split('\n');
            if (origin.length >= 3) {
                // counter
                let counter = origin[0];
                // time
                let timeLine = origin[1];
                let startText = timeLine.match(/^[0-9][0-9]:[0-9][0-9]:[0-9][0-9],[0-9][0-9][0-9]/)[0];
                let endText = timeLine.match(/\s[0-9][0-9]:[0-9][0-9]:[0-9][0-9],[0-9][0-9][0-9]/)[0].replace(' ', '');
                let startDate = this.stringToDate(startText);
                let endDate = this.stringToDate(endText);
                // subtitle 
                let subtitle = '';
                for (let j = 2; j < origin.length; j++) {
                    subtitle = subtitle + origin[j] + '\n';
                }
                // push to list
                this.lines.push({
                    counter: counter,
                    subtitle: subtitle,
                    start: this.dateToObject(startDate),
                    end: this.dateToObject(endDate)
                })
            }
        }
    }

    shift(delta, unit) {
        let time, get;
        switch (unit) {
            case 'hours': {
                time = 1000 * 60 * 60;

                break;
            }
            case 'minutes': {
                time = 1000 * 60;
                break;
            }
            case 'seconds': {
                time = 1000;
                break;
            }
            case 'milliseconds': {
                time = 1;
                break;
            }
        }
        for (let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i];
            let newStartTime = new Date(line.start.time.getTime() + delta * time);
            let newEndTime = new Date(line.end.time.getTime() + delta * time);
            this.updateLineTime(i, newStartTime, newEndTime);
        }
        // update content
        this.updateSrtContent();
    }

    updateLineTime(n, newStartTime, newEndTime) {
        let line = this.lines[n];
        this.lines[n] = {
            counter: line.counter,
            subtitle: line.subtitle,
            start: this.dateToObject(newStartTime),
            end: this.dateToObject(newEndTime)
        }
    }

    updateSrtContent() {
        let srt = '';
        for (let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i];
            srt += line.counter + '\n' +
                line.start.text + ' --> ' + line.end.text + '\n' +
                line.subtitle + '\n\r\n';
        };
        this.srtContent = srt;
    }

    getSrtContent() {
        return this.srtContent;
    }
    // helper functions
    // not main methods
    // used to make everything simple
    stringToDate(string) {
        // turn string format like "00:12:42,321" to date
        let firstColonIndex = string.indexOf(':');
        let secondColonIndex = this.nthChar(string, ':', 2);
        let commaIndex = string.indexOf(',');
        let hour = string.substring(0, firstColonIndex);
        let minute = string.substring(firstColonIndex + 1, secondColonIndex);
        let second = string.substring(secondColonIndex + 1, commaIndex);
        let msecond = string.substring(commaIndex + 1);
        return new Date(1970, 1, 1, hour, minute, second, msecond);
    }
    dateToObject(date) {
        return {
            text: (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds() + ',' + (date.getMilliseconds() < 10 ? '00' : '') + ((date.getMilliseconds() < 100 && date.getMilliseconds() >= 10) ? '0' : '') + date.getMilliseconds(),
            time: date,
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds(),
            milliseconds: date.getMilliseconds()
        }
    }
    nthChar(string, character, n) {
        // find the index of the nth char in string
        let count = 0,
            i = 0;
        while (count < n && (i = string.indexOf(character, i) + 1)) {
            count++;
        }
        if (count == n) return i - 1;
        return NaN;
    }
}