declare module "simple-get" {
    export default function(url: string, callback: (err: Error | undefined, response: any) => void): any;
    function concat(url: string, callback: (err: Error | undefined, response: any, data: Buffer) => void): any;
}
