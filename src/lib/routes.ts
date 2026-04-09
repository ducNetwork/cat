import { NsidString } from '@atproto/lex';
import { LexiconDoc } from '@atproto/lexicon';
import chalk from 'chalk';
import { Context, TypedResponse } from 'hono';
import { BaseMime } from 'hono/utils/mime';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { globalScopes } from './oauth/scopes';

interface RouteOutput { 
  encoding: BaseMime
  body: unknown
}

export interface Route<O extends RouteOutput = any> {
  (c: Context): Promise<TypedResponse<O>>
}

export type Lexicon = Omit<LexiconDoc, 'id' | 'lexicon'>;

export interface RouteFile {
  lexicon?: Lexicon
  route?: Route
  scopes?: string[]
}

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

  public async load(ext: RegExp, dir: string, setter: (file: RouteFile, nsid: string) => void) {
    const routesPath = path.join(this.root, dir);
    const routesDir = fs.readdirSync(routesPath, { recursive: true, withFileTypes: true });
    
    for (const dirent of routesDir) {
      if (!dirent.isFile() || !ext.test(dirent.name)) continue;

      const nameSplit = dirent.name.split('.');
      const fileName = nameSplit.slice(0, nameSplit.length - 1).join('.');
      const file = path.join(dirent.parentPath, fileName);
      const nsid = file
        .replace(routesPath, '')  // remove absolute path
        .replace(fileName, '')    // remove file name
        .replace('/', '')         // remove leading forward-slash
        .replaceAll('/', '.')     // convert to NSID
        + nameSplit[0];           // re-add file name

      setter(
        await import(file), 
        nsid
      );
    }
  }

  public addLex(nsid: string, lexicon: Lexicon) {
    const existingCollection = this.collections.get(nsid);

    this.collections.set(nsid, {
      ...existingCollection,

      lexicon: {
        ...lexicon,

        id: nsid as NsidString,
        lexicon: 1,
      }
    })
  }

  public async loadLex(dir: string) {
    await this.load(/^[^.]*\.lex\.(ts|js)$/, dir, (file, nsid) => {
      console.log(`${chalk.blue('[Lexicon]')} ${nsid}`);

      // add lexicon
      if (file.lexicon) this.addLex(nsid, file.lexicon);
    })
  }

  public addRoute(nsid: string, route: Route) {
    const existingCollection = this.collections.get(nsid);

    // add route
    this.collections.set(nsid, {
      ...existingCollection,
      route
    })
  }

  public async loadRoutes(dir: string) {
    await this.load(/^[^.]*\.(ts|js)$/, dir, (file, nsid) => {
      const existingCollection = this.collections.get(nsid);

      // add route
      if (file.route) {
        this.addRoute(nsid, file.route);

        console.log(
          `${chalk.green('[Route]')} ${nsid} (${existingCollection?.lexicon?.defs.main.type ?? 'unknown'})`
        );
      }

      if (file.scopes) {
        globalScopes.scope(...file.scopes);

        console.log(
          `${chalk.magenta('[Scope]')} ${file.scopes.join(', ')}`
        );
      }
    })
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

      console.log(
        `${chalk.yellow('writing...')} ${path.join(relativeLoc, relativeFile)}`
      );

      fs.writeFileSync(
        file, 
        JSON.stringify(collection.lexicon, null, 2), 
        { flag: 'w' }
      );
    }
  }
}