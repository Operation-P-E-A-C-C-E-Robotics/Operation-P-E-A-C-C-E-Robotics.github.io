---
layout: robot
---

// Make a request for a user with a given ID
axios.get('https://www.thebluealliance.com/api/v3/{{ page.endpoint }}?X-TBA-Auth-Key=hOngAA1OYRpYtrfePLodT2G27R7fSBfrGJ57RwH1sOZJxaJv3rHGfhH37aLitVNb')
  .then(function (response) {
    // handle success
    console.log(response);
    document.getElementById('demo').innerHTML = response.data.team_number;
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
    document.getElementById('demo2').innerHTML = "Always Executed Function ran";
  });