import APIRequest from "./Router.ts";
import Server from "./Structures/Server.ts";

class BlueFox {
    public token!: string;

    /**
     * Creates new BlueFox api client
     * @param authToken Bluefox API Auth token
     */
    public constructor(authToken: string) {
        if (!authToken || typeof authToken !== "string") throw new TypeError("Invalid Auth Token");

        Object.defineProperty(this, "token", {
            writable: true,
            enumerable: false,
            value: authToken
        });
    }

    /**
     * API Router
     */
    get api() {
        return APIRequest(this.token);
    }

    /**
     * Returns server info
     * @param id Server id
     */
    async getServer(id: string): Promise<Server> {
        if (!id || typeof id !== "string") throw new TypeError("Invalid id");
        const data = await this.api.client.servers(id).get();
        return new Server(this, data);
    }

    /**
     * Returns true if the user has this server
     * @param id server id
     */
    async hasServer(id: string): Promise<boolean> {
        if (!id || typeof id !== "string") throw new TypeError("Invalid id");
        
        try {
            let x = await this.api.client.servers(id).get();
            return !!(x && x.attributes && x.attributes.identifier);
        } catch {
            return false;
        }
    }

    /**
     * Returns array of all servers
     */
    async listServers(): Promise<Server[]> {
        const data = await this.api.client.get();
        if (!data || !data.data || !data.data.length || !data.data.map((m: any) => m.object === "server").length) return [];

        return data.data.map((m: any) => new Server(this, m));
    }

    /**
     * Returns user info
     */
    async me(): Promise<User> {
        const data = await this.api.client.account.get();
        return {
            id: data?.attributes?.id,
            admin: data?.attributes?.admin,
            username: data?.attributes?.username,
            email: data?.attributes?.email,
            firstName: data?.attributes?.first_name,
            lastName: data?.attributes?.last_name
        };
    }

}

export interface User {
    id: number;
    admin: boolean;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
}

export { BlueFox };