#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const WEATHER_API_KEY = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";
const server = new McpServer({
    name: "weather",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    }
});
async function makeWeatherRequest(url) {
    const headers = {
        "User-Agent": USER_AGENT,
        Accept: "application/geo+json",
    };
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error status ${response.status}`);
        }
        return (await response.json());
    }
    catch (e) {
        console.error(`error : ${e}`);
        return null;
    }
}
function formatAlert(feature) {
    const props = feature.properties;
    return [
        `Event: ${props.event || "Unknown"}`,
        `Area: ${props.areaDesc || "Unknown"}`,
        `Severity: ${props.severity || "Unknown"}`,
        `Status: ${props.status || "Unknown"}`,
        `Headline: ${props.headline || "No headline"}`,
        "---",
    ].join("\n");
}
server.tool("get_alerts", "Get weather alerts for a state", {
    state: z.string().length(2).describe("Two-letter state code (eg. CA, NY)")
}, async ({ state }) => {
    const statecode = state.toUpperCase();
    const alertsUrl = `${WEATHER_API_KEY}/alerts?area=${statecode}`;
    const alertData = await makeWeatherRequest(alertsUrl);
    if (!alertData) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to retrieve alerts data"
                }
            ]
        };
    }
    const features = alertData.features || [];
    if (features.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: `No active alerts for ${statecode}`
                }
            ]
        };
    }
    const formattedAlerts = features.map(formatAlert);
    const alertsText = `Active alerts for ${statecode}: \n\n ${formattedAlerts.join("\n")}`;
    return {
        content: [
            {
                type: "text",
                text: alertsText
            }
        ]
    };
});
server.tool("get_forecast", "Get weather forecast for a location", {
    latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
    longitude: z.number().min(-180).max(180).describe("Longitudfe of the location")
}, async ({ latitude, longitude }) => {
    const pointsUrl = `${WEATHER_API_KEY}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointsData = await makeWeatherRequest(pointsUrl);
    if (!pointsData) {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to retrieve grid point data for coordinates: ${latitude}`
                }
            ]
        };
    }
    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to get forecast URL from grid point data"
                }
            ]
        };
    }
    const forecastData = await makeWeatherRequest(forecastUrl);
    if (!forecastData) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to retrieve forecast data"
                }
            ]
        };
    }
    const periods = forecastData.properties?.periods || [];
    if (periods.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: "No forecast periods available",
                },
            ],
        };
    }
    const formattedForecast = periods.map((period) => [
        `${period.name || "Unknown"}:`,
        `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
        `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
        `${period.shortForecast || "No forecast available"}`,
        "---",
    ].join("\n"));
    const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;
    return {
        content: [
            {
                type: "text",
                text: forecastText,
            },
        ],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
}
main().catch((e) => {
    console.error("Fatal error in main():", e);
    process.exit(1);
});
