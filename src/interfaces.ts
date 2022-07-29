
export interface TitleAndPassword
{
    title : string,
    newPassword : string,
}

export interface TitleQuery
{
  title: string,
  id: string,
}

export interface encryptionObj
{
  iv: string, password: string,
}

export interface PasswordNecessities
{
  title : string,
  username : string,
  password : string,
}

export type Pair<T,K> = [T,K]

export interface GitHubSecretsFormat
{
  title: string,
  // array of (iv, passwords i.e. myVar=myPassword)
  secrets: any[],
}

