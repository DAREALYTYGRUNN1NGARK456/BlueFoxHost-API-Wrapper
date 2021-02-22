import { BlueFox as BlueFoxClient } from "../BlueFox.ts";

class Server {
    client!: BlueFoxClient;
    type!: string;
    isOwner!: boolean;
    id!: string | null;
    internalID!: number | null;
    uuid!: string | null;
    name!: string | null;
    node!: string | null;
    sftp!: {
        ip: string | null;
        port: number | null
    };
    limits!: {
        memory: number;
        swap: number;
        disk: number;
        io: number;
        cpu: number;
    } | null;
    invocation!: string | null;
    dockerImage!: string | null;
    eggFeatures!: any;
    featureLimits!: {
        databases: number;
        allocations: number;
        backups: number;
    } | null;
    suspended!: boolean;
    installing!: boolean;
    transferring!: boolean;
    meta!: {
        serverOwner: boolean;
        permissions: string[];
    };
    relationships!: {
        allocations: {
            object: string;
            data: any[];
        };
        variables: {
            object: string;
            data: any[];
        };
    } | null;

    constructor(client: BlueFoxClient, data: any) {
        Object.defineProperty(this, "client", {
            enumerable: false,
            value: client,
            writable: false
        });

        this._patch(data);
    }

    private _patch(data: any) {
        if (!data) data = {};

        this.type = data.object ?? "server";
        this.isOwner = data.attributes.server_owner ?? false;
        this.id = data.attributes.identifier ?? null;
        this.internalID = data.attributes.internal_id ?? null;
        this.uuid = data.attributes.uuid ?? null;
        this.name = data.attributes.name ?? null;
        this.node = data.attributes.node ?? null;
        this.sftp = {
            ip: data.attributes.sftp_details.ip ?? null,
            port: data.attributes.sftp_details.port ?? null
        };
        this.limits = data.attributes.limits ?? null;
        this.invocation = data.attributes.invocation ?? null;
        this.dockerImage = data.attributes.docker_image ?? null;
        this.eggFeatures = data.attributes.egg_features ?? null;
        this.featureLimits = data.attributes.feature_limits ?? null;
        this.suspended = data.attributes.is_suspended ?? false;
        this.installing = data.attributes.is_installing ?? false;
        this.transferring = data.attributes.is_transferring ?? false;
        this.meta = {
            serverOwner: data.meta?.is_server_owner ?? false,
            permissions: data.meta?.user_permissions ?? []
        };
        this.relationships = data.attributes.relationships ?? null;
    }

    /**
     * Sends start power action
     */
    async start() {
        await this.power("start");
    }

    /**
     * Sends stop power action
     */
    async stop() {
        await this.power("stop");
    }

    /**
     * Sends restart power action
     */
    async restart() {
        await this.power("restart");
    }

    /**
     * Sends kill power action
     */
    async kill() {
        await this.power("kill");
    }

    /**
     * Sends power action
     * @param action The action name to send
     */
    async power(action: "start" | "stop" | "restart" | "kill"): Promise<void> {
        const actions = ["start", "stop", "restart", "kill"];
        if (!actions.some(x => x === action)) throw new TypeError(`Power action must be one of ${actions.map(m => `"${m}"`).join(", ")} but received "${action}"!`);
        if (!this.id || typeof this.id !== "string") throw new Error("Unknown server");

        try {
            await this.client.api.client.servers(this.id).get();
        } catch {
            throw new Error("Unknown server");
        }

        await this.client.api.client.servers(this.id).power.post({
            data: {
                signal: action
            }
        });
    }

    /**
     * Sets server name
     * @param name new server name to set
     */
    async setName(name: string): Promise<void> {
        if (!name || typeof name !== "string") throw new TypeError("Missing name to set");
        await this.client.api.client.servers(this.id).settings.rename.post({
            data: {
                name: name
            }
        });
    }

    /**
     * Re-installs this server
     */
    async reinstall() {
        return await this.client.api.client.servers(this.id).settings.reinstall.post();
    }

    /**
     * Deletes this server
     * @param force If it should forcefully delete this server
     */
    async delete(force?: boolean) {
        return force ? await this.client.api.application.servers(this.id).delete() : await this.client.api.application.servers(this.id).force.delete();
    }

    async send(command: string): Promise<void> {
        if (!command || typeof command !== "string") throw new TypeError("Missing command to send");
        await this.client.api.client.servers(this.id).command.post({
            data: {
                command: command
            }
        });
    }

    toString() {
        return this.name ?? "Unknown Server";
    }

}

export { Server };
export default Server;