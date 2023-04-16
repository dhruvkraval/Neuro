import { YoutubeTranscript } from 'youtube-transcript';

YoutubeTranscript.fetchTranscript('https://www.youtube.com/watch?v=LAXQIlpRdQU').then(console.log);



// import { config } from "dotenv"
// config()

// import { Configuration, OpenAIApi } from "openai"

// const openai = new OpenAIApi(new Configuration({
//     apiKey: process.env.API_KEY
// }))



// function getInformation()
// {
//     var response = "web development"
//     callGPT(response)
// }

// function callGPT(input)
// {
//     openai.createChatCompletion({
//         model: "gpt-3.5-turbo",
//         messages: [{role: "user", content: "return a json file with a sequential roadmap to learn" +  input + "with no descriptions or commentary"}],
//     }).then(res => {
//         console.log(res.data.choices[0].message.content)
//     })
// }



// getInformation();