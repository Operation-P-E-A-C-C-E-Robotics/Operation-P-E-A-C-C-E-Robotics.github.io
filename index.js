const core = require('@actions/core');
const github = require('@actions/github');
const tba = require("tba-js");

tba.getMatches("2016", "casd", (data) =>{
    console.dir(data);
});

