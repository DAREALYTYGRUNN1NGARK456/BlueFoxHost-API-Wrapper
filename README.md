# BlueFox
**[BlueFox](https://bluefoxhost.com)** API Wrapper for **[Deno](https://deno.land)**.

# Example
# Get a server and shut down

```js
import { Client } from "https://deno.land/x/bluefox/mod.ts";

const client = new Client("YOUR_AUTH_TOKEN");

const server = await client.getServer("server_id");
console.log(`Shutting down ${server.name}...`);
await server.stop();
```