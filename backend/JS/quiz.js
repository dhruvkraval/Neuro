import fs from "fs"
import { writeFile } from 'fs/promises'
import { config } from "dotenv"
config()

import { Configuration, OpenAIApi } from "openai"

const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.API_KEY
}))

var summarizedText = "";

// Set the path of the local text file
const filePath = "backend/summary.txt";

function getString(){
    // Read the contents of the file
    fs.readFile(filePath, "utf8", function(err, data) {
        if (err) {
        // Handle the error
        console.error(err);
        } else {
        // Store the contents of the file to a string
        const fileContent = data.toString();
        summarizedText = fileContent;
        // Use the fileContent string as needed
        // console.log(summarizedText);
       
    }
    });
}

function getQuestions(){
    openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: "Consider the following text: " + summarizedText + "Make a 5 question multiple choice quiz on this content, and return it as a json string with the fields: num, question, answer, options. Do not write any other text other than the JSON."}],
    }).then(res => {
        writeFile('quiz.json', res.data.choices[0].message.content, 'utf8')
        console.log(res.data.choices[0].message.content)
    })
}


getString();
getQuestions();