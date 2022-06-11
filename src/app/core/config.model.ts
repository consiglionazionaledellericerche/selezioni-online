export class Config {
  constructor(public gateway: string, public oidc: Oidc) {}
}
export class Oidc {
  constructor(
    public enable: string, 
    public authority: string,
    public redirectUrl: string,
    public clientId: string    
  ) {}

}