// Countdown timer functionality


/**
 * Update match countdown timer
 * @param {number} countDownDate - Unix timestamp to count down to
 * @param {HTMLElement} counterEl - Element to display countdown
 * @param {HTMLElement} timeEl - Element to display current time
 * @returns {number} Interval ID
 */
function matchCountdown(countDownDate, counterEl, timeEl) {
    const interval = setInterval(() => {
        const now = convertTime(new Date()).getTime();
        const currentTime = new Date().toLocaleTimeString();
        const distance = new Date(formatTimestamp(countDownDate)).getTime() - now;
        
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (!counterEl || !timeEl) {
            clearInterval(interval);
            return;
        }

        counterEl.innerHTML = `~${hours}h ${minutes}m ${seconds}s`;
        timeEl.innerHTML = currentTime;
        counterEl.classList.remove('yellowwarning', 'redalliance');

        if (hours === 0 && minutes < 20) {
            counterEl.classList.add('yellowwarning');
            counterEl.innerHTML = `~${hours}h ${minutes}m ${seconds}s DOUBLE QUEUE`;
        }
        if (hours === 0 && minutes < 10) {
            counterEl.classList.add('redalliance');
            counterEl.innerHTML = `~${hours}h ${minutes}m ${seconds}s QUEUE`;
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
 * @returns {number} Interval ID
 */
function eventCountdown(event, counterEl) {
    const eventDate = new Date(event.start_date + "T09:00:00-04:00");
    
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
            clearInterval(interval);
            return;
        }

    $(counterEl).find('.countdown-days').text(days);
    $(counterEl).find('.countdown-hours').text(hours);
    $(counterEl).find('.countdown-minutes').text(minutes);
    $(counterEl).find('.countdown-seconds').text(seconds);
    }, 1000);

    return interval;
}

