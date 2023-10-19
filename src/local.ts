import GameManager from 'Game/GameManager';
import Inventory from 'Game/Level/GameState/Inventory';
import LevelParser from 'Game/Level/Generation/AssetLoading/LevelParser';
import { parseString } from 'xml2js';
import { readFileSync } from 'fs';

process.chdir('./dist');

export class LocalLevelParser extends LevelParser {
  private cache = new Map<string, object>();

  constructor() {
    super();
    this.Preload();
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

GameManager.Init(new LocalLevelParser(), undefined, () => new Inventory());
GameManager.SolveLevel(0);
