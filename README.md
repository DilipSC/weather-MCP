## 🌦️ Weather MCP Server

This project is a [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol) compatible weather server that provides:

* 🌩️ Active weather alerts for U.S. states
* 🌤️ 7-day forecasts for a given latitude and longitude

It connects to Claude Desktop using the `stdio` transport.

---

## 📁 Project Structure

```
MCP_pracc/
├── src/
│   └── index.ts        # Main MCP server source code
├── build/              # Output folder for compiled JS
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the project & install dependencies

```bash
npm install
```

---

### 2. Build the TypeScript source

```bash
npm run build
```

> This will compile `src/index.ts` into `build/index.js` with proper ES module output.

---

### 3. Run the MCP server

```bash
node ./build/index.js
```

You should see:

```
Weather MCP Server running on stdio
```

If you do, your MCP server is ready to be connected to Claude Desktop.

for more info get a look at [Fireship](https://youtu.be/HyzlYwjoXOQ?si=sG5HqCKfROaby5mc)

---

## 🧠 Connecting to Claude Desktop

1. Open **Claude Desktop**
2. Go to **Settings → Model Context Protocol → Edit Config File**
3. Add this to your `config.json`:

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": [
        "path/to/index/build/index.js"
      ]
    }
  }
}
```

> ✅ Ensure the path matches the location of your compiled `index.js` file
> ✅ Use forward slashes `/` even on Windows

4. Restart Claude Desktop

---

## 🧪 Usage from Claude

Try these tool calls inside Claude's prompt:

```bash
/tools get_alerts { "state": "CA" }
```

```bash
/tools get_forecast { "latitude": 37.7749, "longitude": -122.4194 }
```

---

## 🛠 Developer Notes

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "build",
    "rootDir": "src",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["build"]
}
```

### Scripts (`package.json`)

```json
"bin": {
    "weather": "./build/index.js"
},
"scripts": {
  "build": "tsc && chmod 755 build/index.js"
}
```

---

## 📦 Dependencies

* [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
* [`zod`](https://www.npmjs.com/package/zod)


