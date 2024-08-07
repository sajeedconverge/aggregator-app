export interface UserRegisterRequest {
    email: string
    firstName: string
    lastName: string
    password: string
}

export interface UserLoginRequest {
    email: string
    password: string
}

export interface ProviderTokenRequest {
    email: string
    provider: string
    token: string
  }