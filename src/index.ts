import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js"

import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js"

import {z} from "zod"

const WEATHER_API_KEY="https://api.weather.gov"

const USER_AGENT="weather-app/1.0"


const server = new McpServer({
    name:"weather",
    version:"1.0.0",
    capabilities:{
        resources:{},
        tools:{},
    }
})


async function makeWeatherRequest<T>(url:string):Promise<T | null>{
    const headers = {
        "User-Agent":USER_AGENT,
        Accept: "application/geo+json",
    };

    try{
        const response = await fetch(url,{headers})

        if(!response.ok){
            throw new Error(`HTTP error status ${response.status}`)
        }
        return (await response.json()) as T 

    }
    catch(e){
        console.error(`error : ${e}`);
        return null
    }
}


server.tool(
    
)