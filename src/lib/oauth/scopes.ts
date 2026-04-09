export class OAuthScopeManager {
  public readonly scopes: string[] = [];

  constructor(...scopes: string[]) {
    this.scope(...scopes);
  }

  public scope(...scope: string[]) {
    this.scopes.push(...scope);
    return this;
  }

  public toString() {
    return this.scopes.join(' ');
  }
}

export const globalScopes = new OAuthScopeManager('atproto');