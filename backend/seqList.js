import { config } from "dotenv"
config()

import { Configuration, OpenAIApi } from "openai"

const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.API_KEY
}))

import fs from 'fs';


function getInformation()
{
    var response = "web development"
    callGPT(response)
}

function callGPT(input)
{
    openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: "return a chronological roadmap to learn web development with under 10 sections with no descriptions or commentary as strings separated by ,"}],
    }).then(res => {
        const delimiter = ",";
        var newArray = splitString(res.data.choices[0].message.content, delimiter)
        fs.writeFileSync('map.json', arrayToNestedJson(newArray));
        console.log(res.data.choices[0].message.content)
    })
}

function splitString(originalString, delimiter) {
    return originalString.split(delimiter);
  }

  function arrayToNestedJson(arr) {
    let obj = {};
    let current = obj;
    
    for (let i = 0; i < arr.length; i++) {
      current.name = arr[i];
      current.children = [];
      if (i !== arr.length - 1) {
        current.children.push({});
        current = current.children[0];
      }
    }
    
    return JSON.stringify(obj, null, 2);
  }

getInformation();