import { NsidString } from '@atproto/lex';
import { LexiconDoc } from '@atproto/lexicon';
import { Context, TypedResponse, InferResponseType, Env } from 'hono';
import { BaseMime } from 'hono/utils/mime';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { scopes } from './oauth/scopes';

interface RouteOutput { 
  encoding: BaseMime
  body: unknown
}

export interface Route<O extends RouteOutput = any> {
  (c: Context): Promise<TypedResponse<O>>
}

export type Lexicon = Omit<LexiconDoc, 'id' | 'lexicon'>;

export interface RouteCollection {
  lexicon?: LexiconDoc
  route?: Route
}

export class RouteManager {
  readonly root: string;
  readonly collections = new Map<string, RouteCollection>();

  constructor(root: string) {
    this.root = root;
  }

  public async load(dir: string) {
    const routesPath = path.join(this.root, dir);
    const routesDir = fs.readdirSync(routesPath, { recursive: true, withFileTypes: true });
    
    for (const dirent of routesDir) {
      if (dirent.isFile()) {
        const file = path.join(dirent.parentPath, dirent.name.split('.')[0]);
        const nsid = file.replace(routesPath, '').replace('/', '').replaceAll('/', '.');

        const ts = await import(file);

        if (ts.route) console.log(`[Route] ${nsid}`);

        // Add OAuth scopes
        if (ts.scopes) scopes.scope(...ts.scopes);
        
        // Add route & lexicon
        this.collections.set(nsid, {
          lexicon: ts.lexicon 
            ? {
              id: nsid as NsidString,
              lexicon: 1,
              ...ts.lexicon
            }
            : undefined,

          route: ts.route
        })
      }
    }
  }

  public generate(dir: string) {
    const lexiconsPath = path.join(this.root, dir);

    for (const [nsid, collection] of this.collections.entries()) {
      if (!collection.lexicon) continue;

      const nsidSplit = nsid.split('.');
      const relativeLoc = './' + nsidSplit.slice(0, nsidSplit.length - 1).join('/');
      const loc = path.join(lexiconsPath, relativeLoc);

      fs.mkdirSync(loc, { recursive: true });

      const relativeFile = `./${nsidSplit[nsidSplit.length - 1]}.json`;
      const file = path.join(loc, relativeFile);

      console.log(`[Lexicon] ${nsid} -> ${path.join(relativeLoc, relativeFile)}`);

      fs.writeFileSync(
        file, 
        JSON.stringify(collection.lexicon, null, 2), 
        { flag: 'w' }
      );
    }
  }
}