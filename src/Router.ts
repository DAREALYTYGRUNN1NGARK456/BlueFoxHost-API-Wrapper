// inspired by discordjs api router
import { noop, RouterMethods as methods, BASE_URL, TOKEN_PREFIX, ENCODING } from "./Constants.ts";

const reflectors = [
    "toString",
    "valueOf",
    "inspect",
    "constructor",
    Symbol.toPrimitive
];

const getPath = (a: any, s: any) => {
    let qs;
    if (s) {
        qs = Object.entries(s)
        .filter(([, value]) => value !== null && typeof value !== "undefined")
        .flatMap(([key, value]) => (Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]));
        qs = new URLSearchParams(s).toString();
    }

    return typeof s === "string" ? `${a}?${s}` : a;
};

function handleResponse(res: Response) {
    if (res.status >= 200 && res.status < 400) {
        const response = res.json().catch(() => { });
        return response;
    }
    throw new Error(`[${res.statusText}] Rejected with status code "${res.status}"!`);
}

export default function make(token: string) {
    const route = [""];
    const handler = {
        get(target: any, name: any): any {
            if (reflectors.includes(name)) return () => route.join("/");
            if (methods.includes(name)) {
                const routeBucket: any = [];
                for (let i = 0; i < route.length; i++) {
                    routeBucket.push(route[i]);
                }
                return (options: any) => {
                    options = options ?? {};
                    return fetch(`${BASE_URL}${getPath(route.join("/"), options.query)}`, {
                        method: name.toUpperCase(),
                        redirect: "follow",
                        headers: {
                            "Authorization": `${TOKEN_PREFIX} ${token}`,
                            "Content-Type": ENCODING,
                            "Accept": ENCODING
                        },
                        body: JSON.stringify(options.data || {})
                    }).then(handleResponse);
                }
            }
            route.push(name);
            return new Proxy(noop, handler);
        },
        apply(target: any, _: any, args: any): any {
            route.push(...args.filter((x: any) => x != null));
            return new Proxy(noop, handler);
        },
    };
    return new Proxy(noop, handler);
}