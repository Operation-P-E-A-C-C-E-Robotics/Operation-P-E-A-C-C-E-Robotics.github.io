import { playOnFieldNotification, playOnFieldSoondNotification } from "./helpers.js";

/**
 * Update match countdown timer
 * @param {number} countDownDate - Unix timestamp to count down to
 * @param {HTMLElement} counterEl - Element to display countdown
 * @param {HTMLElement} timeEl - Element to display current time
 * @returns {number} Interval ID
 */

function eventLocalTime(eventTimeZone, timeEl) {
    const interval = setInterval(() => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString("en-US", { timeZone: eventTimeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short });
        if (timeEl) {
            timeEl.innerText = `${currentTime}`;
            timeEl.style.display = 'block';
        } else {
            clearInterval(interval);
        }
    }, 1000);

    return interval;
}

function matchCountdown(countDownDate, counterEl, callBackFunction = null, audioNotification = false) {
    console.log("match countdown set, audio notification:", audioNotification)
    var hasPlayedNotif = false;
    const interval = setInterval(() => {
        const now = new Date();//.toLocaleTimeString("en-US", {hour: '2-digit', minute: '2-digit', second: '2-digit' }).getTime();
        // const currentTime = now.toLocaleTimeString("en-US", { timeZone: eventTimeZone, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const distance = new Date(countDownDate).getTime() - now.getTime();
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (!counterEl) {
            clearInterval(interval);
            return;
        }
        let display;
        if (days > 0) {
            display = `${days.toString().padStart(2, '0') + "d"} ${hours.toString().padStart(2, '0') + "h"} ${minutes.toString().padStart(2, '0') + "m"}`;
        } else {
            if (hours === 0) {
                display = `${minutes.toString().padStart(2, '0') + ":"}${seconds.toString().padStart(2, '0')}`;
            } else {
                display = `${hours.toString().padStart(2, '0') + ":"}${minutes.toString().padStart(2, '0') + ":"}${seconds.toString().padStart(2, '0')}`;
            }
            
        }
        counterEl.innerText = `${display}`;
        counterEl.classList.remove('yellowwarning', 'redalliance');
        if (days === 0 && hours === 0 && minutes <= 10) {
            counterEl.classList.add('redalliance');
            //counterEl.innerHTML = `~${hours}h ${minutes}m ${seconds}s`;
        } else if (days === 0 && hours === 0 && minutes <= 20) {
            counterEl.classList.add('yellowwarning');
            //counterEl.innerHTML = `~${hours}h ${minutes}m ${seconds}s`;
        } else {
            counterEl.classList.remove('yellowwarning', 'redalliance');
        }
        if (days === 0 && hours === 0 && minutes === 5 && seconds >= 50 && audioNotification == true) {
            playOnFieldSoondNotification();
        }
        if (days === 0 && hours === 0 && minutes === 0 && seconds <= 10 && audioNotification == true) {
            playOnFieldNotification(); //if the User toggled the audio notification to true on the gameday page
        } 
        if (distance < 0) {
            counterEl.innerText = `On Field Soon!`;
            if (typeof callBackFunction === "function") {
                callBackFunction();
            }
            //setBanner(); // Refresh banner to show match results
            clearInterval(interval);
            return;
        }

    }, 1000);

    return interval;
}

/**
 * Update kickoff countdown timer
 * @param {HTMLElement} counterEl - Element to display countdown
 * @returns {number} Interval ID
 */
function kickoffCountdown(counterEl) {
    const year = getCurrentSeasonYear();
    const kickoffDate = getKickoffDate(year);
    
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = kickoffDate.getTime() - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (!counterEl) {
            clearInterval(interval);
            return;
        }

        if (distance < 0) {
            counterEl.style.display = 'none';
            clearInterval(interval);
            return;
        }

        counterEl.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);

    return interval;
}

/**
 * Update event countdown timer
 * @param {Object} event - Event object with start_date property
 * @param {HTMLElement} counterEl - Element to display countdown
 * @param {Function} callBackFunction - Function to call when countdown completes
 * @returns {number} Interval ID
 */
function eventCountdown(event, counterEl, callBackFunction = null) {
    const eventDate = new Date(event.start_date)//.toLocaleTimeString("en-US", { timeZone: event.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' });;
    
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = eventDate.getTime() - now;
        
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        hours %= 24;
        minutes %= 60;
        seconds %= 60;
        if (!counterEl) {
            clearInterval(interval);
            return;
        }

        if (distance < 0) {
            counterEl.style.display = 'none';
            if (typeof callBackFunction === "function") {
                callBackFunction();
            }
            clearInterval(interval);
            return;
        }

        $(counterEl).find('.countdown-days').text(String(days).padStart(2, '0'));
        $(counterEl).find('.countdown-hours').text(String(hours).padStart(2, '0'));
        $(counterEl).find('.countdown-minutes').text(String(minutes).padStart(2, '0'));
        $(counterEl).find('.countdown-seconds').text(String(seconds).padStart(2, '0'));
    }, 1000);

    return interval;
}

export { matchCountdown, kickoffCountdown, eventCountdown, eventLocalTime };
