function showAlert(obj){
    var html = `<div class="alert alert-${obj.class} alert-dismissible fade show mt-0 mb-0" id="alertMain">
  <button type="button" class="close" data-dismiss="alert">&times;</button>
  <div id="alertText"><strong>${obj.header}</strong> ${obj.message}</div>
  </div>`;

    $('#alert').append(html);
}

function getFirstSaturdayInJanuary(year) {
  const january = 0; // January is month 0
  // const year = year; // Get the current year

  // Loop through the days of January until you find a Saturday that is not January 1st
  
  let found = false
// Start from January 2nd (day 2) and go up to January 7th (day 7)
    for (let day=2; day<18; day++) {
      if (found == true) {
        break
      }
      const thisdate = new Date(year=year, monthIndex=january, date=day, "12", "00");

      // Check if the day is a Saturday (where 0 is Sunday and 6 is Saturday) and not January 1st
      if (thisdate.getDay() == 6) {
        console.log("accepted date " + thisdate)
        found = true
        return new Date(thisdate.getFullYear(), thisdate.getMonth(), thisdate.getDate(), "12", "00")
      } else {
        console.log("rejecting date" + thisdate)
      }
  
    }
  

  // If no suitable date is found, you can return a message or handle it as needed
  return "No suitable date found in January.";
}

function playOnFieldNotification() {
  if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const now = audioCtx.currentTime;

  function tone(freq, start, duration) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      // louder but still smooth
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.6, start + 0.01); // louder
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.start(start);
      osc.stop(start + duration);
  }

  // modern three-note "ding"
  tone(700, now, 0.16);
  tone(900, now + 0.14, 0.18);
  tone(1200, now + 0.28, 0.22);
}

function playOnFieldSoondNotification() {
  if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const now = audioCtx.currentTime;

  function tone(freq, start, duration) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      // louder but still smooth
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.6, start + 0.01); // louder
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.start(start);
      osc.stop(start + duration);
  }

  // modern two-note "ding"
  tone(700, now, 0.16);
  tone(1200, now + 0.28, 0.22);
}

 


function toggleDarkMode() {
  var isDarkMode = document.body.classList.contains('bg-dark');

  // Toggle Bootstrap 4 classes for background and text color
  if (isDarkMode) {
      document.body.classList.remove('bg-dark', 'text-light');
      document.body.classList.add('bg-light', 'text-dark');
      localStorage.setItem('bg-dark', 'false'); // Store as a string
  } else {
      document.body.classList.add('bg-dark', 'text-light');
      document.body.classList.remove('bg-light', 'text-dark');
      localStorage.setItem('bg-dark', 'true'); // Store as a string
  }
}




document.addEventListener('DOMContentLoaded', function() {
  const myButton = document.getElementById('darkModeToggle');
  // Retrieve the dark mode preference from localStorage on page load
  var isDarkModePreference = localStorage.getItem('bg-dark');

  if (isDarkModePreference === 'true') {
    toggleDarkMode(); // If the preference is 'true', set dark mode
  }
  // Define the function you want to run when the button is pressed
  function handleClick() {
      alert('Button Clicked!'); // You can replace this with your custom code.
  }

  // Add a click event listener to the button
  try {
    myButton.addEventListener('click', toggleDarkMode);
  } catch (error) {
    console.error('Error occurred while adding event listener:', error);
    document.body.classList.remove("bg-dark"); //Default to light mode
    document.body.classList.remove("text-light")
    document.body.classList.add("bg-light")
  }
});

export { playOnFieldNotification, playOnFieldSoondNotification }
window.playOnFieldNotif = playOnFieldNotification
window.playOnFieldSoonNotif = playOnFieldSoondNotification