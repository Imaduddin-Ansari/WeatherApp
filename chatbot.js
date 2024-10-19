const chatButton=document.querySelector('#sendquestion');
const chatInput=document.querySelector('#question');
const chatResponse=document.querySelector('.response');
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const OPENWEATHER_API_KEY = '42a8f29170c4ce1593ce0bffe6bd20fc';
const GEMINI_API_KEY = 'AIzaSyBETXqWStPwfjh1Og2j4vU63NRtnFQWhLM';
import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';

let userquery;

const createChatMsg=(message,className) => {
    const chatli=document.createElement("li");
    chatli.classList.add("chat",className);
    let chatcontent=className==="outgoing"? `<p>${message}</p>`:`<span class="robot"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M160-120v-200q0-33 23.5-56.5T240-400h480q33 0 56.5 23.5T800-320v200H160Zm200-320q-83 0-141.5-58.5T160-640q0-83 58.5-141.5T360-840h240q83 0 141.5 58.5T800-640q0 83-58.5 141.5T600-440H360ZM240-200h480v-120H240v120Zm120-320h240q50 0 85-35t35-85q0-50-35-85t-85-35H360q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0-80q17 0 28.5-11.5T400-640q0-17-11.5-28.5T360-680q-17 0-28.5 11.5T320-640q0 17 11.5 28.5T360-600Zm240 0q17 0 28.5-11.5T640-640q0-17-11.5-28.5T600-680q-17 0-28.5 11.5T560-640q0 17 11.5 28.5T600-600ZM480-200Zm0-440Z"/></svg><p class="robottyping">${message}</p></span>`
    chatli.innerHTML=chatcontent;
    return chatli;
}

const DEBUG = true;
let genAI;
try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    if (DEBUG) console.log('Gemini initialized successfully');
} catch (error) {
    logError(error, 'Gemini initialization');
}

function logError(error, context) {
    if (DEBUG) {
        console.error(`Error in ${context}: ${error}`);
    }
}

async function handleChat() {
    const userInput = chatInput.value.trim();
    
    if (!userInput) return;

    chatResponse.appendChild(createChatMsg(`${userInput}`, 'outgoing'));
    
    try {
        const intent = await analyzeIntent(userInput);
        
        if (DEBUG) console.log('Intent analysis:', intent);
        
        let response;
        if (intent.isWeatherQuery) {
            const city = intent.city || 'Islamabad'; // Default city
            const attribute = intent.attribute || null; // Extracted attribute
            try {
                response = await fetchWeather(city, attribute);
            } catch (error) {
                response = "Sorry, I couldn't fetch the weather data. Please try again.";
            }
        } else {
            response = "I can only answer weather-related questions. Could you please ask about the weather?";
        }
        
        chatResponse.appendChild(createChatMsg(`${response}`, 'incoming'));
    } catch (error) {
        logError(error, 'Chat handling');
        chatResponse.appendChild(createChatMsg('Sorry, I encountered an error. Please try again.', 'incoming'));
    }
    
    chatInput.value = '';
    chatResponse.scrollTop = chatResponse.scrollHeight; // Scroll to the latest message
}


async function analyzeIntent(userInput) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `
        Analyze if this is a weather-related query, extract any city mentioned, and identify the specific weather attribute requested (e.g., temperature, wind speed, humidity).
        Return JSON only in this format:
        {
            "isWeatherQuery": boolean,
            "city": string or null,
            "attribute": string or null,
            "confidence": number between 0 and 1
        }
        User query: "${userInput}"`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const parsedResponse = JSON.parse(response.text());
        if (DEBUG) console.log('Gemini response:', parsedResponse);
        return parsedResponse;
    } catch (error) {
        logError(error, 'Gemini analysis');
        return basicIntentAnalysis(userInput);
    }
}

function extractWeatherAttribute(userInput) {
    const attributes = {
        'temperature': ['temperature', 'temp'],
        'humidity': ['humidity', 'humid'],
        'wind speed': ['wind', 'wind speed'],
        'max temperature': ['max temp', 'maximum temperature', 'highest'],
        'min temperature': ['min temp', 'minimum temperature', 'lowest'],
        'pressure': ['pressure', 'air pressure'],
        'feels like': ['feels like', 'real feel']
    };

    for (const [attribute, keywords] of Object.entries(attributes)) {
        if (keywords.some(keyword => userInput.toLowerCase().includes(keyword))) {
            return attribute;
        }
    }
    return null;
}

function basicIntentAnalysis(userInput) {
    const lowercaseInput = userInput.toLowerCase();
    const weatherKeywords = ['weather', 'temperature', 'humidity', 'wind', 'rain', 'sunny', 'cloudy', 'forecast'];
    const isWeatherQuery = weatherKeywords.some(keyword => lowercaseInput.includes(keyword));
    
    return {
        isWeatherQuery: isWeatherQuery,
        city: extractCity(userInput),
        attribute: extractWeatherAttribute(userInput),
        confidence: isWeatherQuery ? 0.8 : 0.2
    };
}

function extractCity(userInput) {
    const words = userInput.split(' ');
    const commonWords = new Set(['weather', 'in', 'the', 'what', 'is', 'tell', 'me', 'about', 'how', 'today', '?', 'today?', 'temperature', 'humidity', 'wind', 'speed']);
    
    for (let word of words) {
        if (!commonWords.has(word.toLowerCase()) && word.length > 2) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
    }
    return null;
}
async function fetchWeather(city, attribute = null) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Weather data not found');

        const data = await response.json();
        if (DEBUG) console.log('Weather data:', data);

        let result = `The weather in ${city} is currently ${data.weather[0].description}.`;

        if (attribute) {
            switch (attribute) {
                case 'temperature':
                    result += ` The temperature is ${Math.round(data.main.temp)}°C.`;
                    break;
                case 'humidity':
                    result += ` The humidity is ${data.main.humidity}%.`;
                    break;
                case 'wind speed':
                    result += ` The wind speed is ${data.wind.speed} m/s.`;
                    break;
                case 'max temperature':
                    result += ` The maximum temperature is ${Math.round(data.main.temp_max)}°C.`;
                    break;
                case 'min temperature':
                    result += ` The minimum temperature is ${Math.round(data.main.temp_min)}°C.`;
                    break;
                case 'pressure':
                    result += ` The atmospheric pressure is ${data.main.pressure} hPa.`;
                    break;
                case 'feels like':
                    result += ` It feels like ${Math.round(data.main.feels_like)}°C.`;
                    break;
                default:
                    result += ` The temperature is ${Math.round(data.main.temp)}°C.`;
            }
        } else {
            result += ` The temperature is ${Math.round(data.main.temp)}°C, with humidity at ${data.main.humidity}% and wind speed at ${data.wind.speed} m/s.`;
        }

        return result;
    } catch (error) {
        logError(error, 'Weather API');
        throw error;
    }
}

chatButton.addEventListener('click', handleChat);
chatButton.addEventListener('click',function(){
    chatResponse.scrollTop=chatResponse.scrollHeight;
})

window.addEventListener('DOMContentLoaded', () => {
    chatResponse.appendChild(createChatMsg('Hello! Ask me about the weather in any city.', 'incoming'));
});