const core = require('@actions/core');
const github = require('@actions/github');
const tba = require("tba-js");

tba.setAppID("frc4909:tba-api:v0.0.1");

tba.getMatches("2016", "casd", (data) =>{
    console.dir(data);
});

