export class OAuthScopeManager {
  public readonly scopes: string[] = [];

  constructor(...managers: OAuthScopeManager[]) {
    managers.forEach(m => this.scopes.push(...m.scopes));
  }

  public scope(...scope: string[]) {
    this.scopes.push(...scope);
    return this;
  }
}

export const scopes = new OAuthScopeManager();