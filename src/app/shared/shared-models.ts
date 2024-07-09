export interface ResponseModel{
    statusCode: number
    payload: any
    message: string
    status: boolean
}

export interface SpotifySettings {
    clientId: string;
    clientSecret: string;
    scopes: string;
    redirectClientUrl: string;
}