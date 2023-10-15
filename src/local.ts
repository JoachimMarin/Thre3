process.chdir('./dist');

import LevelParser from 'Level/LevelParser';
import LevelState from 'Level/LevelState';
import { readFileSync } from 'fs';
import { parseString } from 'xml2js';

export class LocalLevelParser extends LevelParser {
  private cache = new Map<string, object>();

  constructor() {
    super();
  }

  override RegisterAsset(_key: string) {}

  override ReadXmlFile(key: string, path: string): void {
    const content = readFileSync(path, 'utf8');
    let data = {};
    parseString(content, function (err, result: object) {
      data = result;
    });

    this.cache.set(key, data);
  }

  override GetXmlObject(key: string): object {
    return this.cache.get(key);
  }
}

const parser = new LocalLevelParser();
parser.Preload();

const state = new LevelState(null);
state.SolveLevel(0, parser);
