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
  for (let day = 2; day <= 7; day++) { // Start from January 2nd (day 2) and go up to January 7th (day 7)
    const date = new Date(year, january, day);

    // Check if the day is a Saturday (where 0 is Sunday and 6 is Saturday) and not January 1st
    if (date.getDay() === 6 && day !== 1) {
      return date; // Found the first Saturday in January that is not New Year's Day
    }
  }

  // If no suitable date is found, you can return a message or handle it as needed
  return "No suitable date found in January.";
}
