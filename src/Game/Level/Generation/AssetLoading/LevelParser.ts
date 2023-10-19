import Item from 'Game/Level/GameObjects/PrePlaced/Item';
import LevelState from 'Game/Level/GameState/LevelState';
import ImageDefinitions from 'Game/Level/Generation/AssetDefinitions/ImageDefinitions';

import ItemDefinitions from 'Game/Level/Generation/AssetDefinitions/ItemDefinitions';
import LevelList from 'Game/Level/Generation/AssetDefinitions/LevelList';
import TileDefinitions from 'Game/Level/Generation/AssetDefinitions/TileDefinitions';
import ImageKey from 'Game/Level/Generation/AssetLoading/ImageKey';

import ItemType from 'Game/Level/Generation/AssetLoading/ItemType';
import Tile from 'Game/Level/Generation/AssetLoading/Tile';
import { IVec2 } from 'Utils/Math/GridPoint';

// ensure correct initialization order by importing object definitions
// this function is a workaround for unused import warnings
function ImportAssets(..._args: object[]) {}
ImportAssets(TileDefinitions, ImageDefinitions, ItemDefinitions);

/**
 * TilesFile parses the .tsx file from the Tiled level editor.
 * This file contains a mapping from image path to tile id.
 */
class TilesFile {
  public tileDict: { [key: integer]: string } = {};

  constructor(data: object) {
    const tileset = data['tileset'];
    const tiles = tileset['tile'];
    for (const tile of tiles) {
      const id = parseInt(tile['$']['id']) + 1;
      const images = tile['image'];
      const image = images[0]['$'];
      const source: string = image['source'];
      this.tileDict[id] = source.substring(0, source.length - 4);
    }
  }
}

/**
 * LevelFile parses the .tmx from the Tiled level editor.
 * This file contains a matrix listing the tile found at each grid point.
 */
class LevelFile {
  public readonly width: integer = 0;
  public readonly height: integer = 0;
  public readonly objects: integer[][][] = [];

  constructor(data: object) {
    const map = data['map'];
    const layers = map['layer'];

    for (const layer of layers) {
      this.width = Math.max(this.width, parseInt(layer['$']['width']));
      this.height = Math.max(this.height, parseInt(layer['$']['height']));
    }

    this.objects = [];
    for (let x = 0; x < this.width; x++) {
      this.objects[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.objects[x][y] = [];
      }
    }
    for (const layer of layers) {
      const data = layer['data'][0];
      const dataContent = data['_'];
      const rawData = dataContent
        .replace('\n', '')
        .replace('\r', '')
        .split(',');
      let i = 0;
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idAt = parseInt(rawData[i]);
          if (idAt != 0) {
            this.objects[x][y].push(idAt);
          }
          i++;
        }
      }
    }
  }
}

export default abstract class LevelParser {
  private tileDict: {
    [key: string]: (state: LevelState, point: IVec2) => void;
  } = {};
  public levelIndex: integer;
  public tilesFile: TilesFile;
  public levelFile: LevelFile;

  abstract RegisterAsset(_key: string): void;
  abstract ReadXmlFile(_key: string, _path: string): void;
  abstract GetXmlObject(_key: string): object;
  RegisterTile(key: string, fun: (state: LevelState, point: IVec2) => void) {
    this.tileDict[key] = fun;
  }
  Preload() {
    for (const tile of Tile.ALL) {
      this.RegisterTile(tile.imageKey, tile.fun);
    }

    for (const itemType of ItemType.ALL) {
      this.RegisterTile(
        itemType.imageKey,
        (state, point) => new Item(state.staticState, point, itemType)
      );
    }

    for (const imageKey of ImageKey.ALL) {
      this.RegisterAsset(imageKey.imageKey);
    }

    this.ReadXmlFile('tiles', 'assets/tiles.tsx');
    for (let i = 0; i < LevelList.length; i++) {
      this.ReadXmlFile(
        LevelList[i].fileName,
        'assets/levels/' + LevelList[i].fileName + '.tmx'
      );
    }
  }
  LoadLevelInfo(levelIndex: integer) {
    /**
     * Loads level information from the loaded .tsx and .tmx files.
     */
    this.levelIndex = levelIndex;
    this.tilesFile = new TilesFile(this.GetXmlObject('tiles'));
    console.log(levelIndex);
    this.levelFile = new LevelFile(
      this.GetXmlObject(LevelList[levelIndex].fileName)
    );
  }

  BuildLevel(state: LevelState) {
    state.dynamicState.lockGridKey = true;
    for (let y = 0; y < this.levelFile.height; y++) {
      for (let x = 0; x < this.levelFile.width; x++) {
        for (const objectId of this.levelFile.objects[x][y]) {
          const key = this.tilesFile.tileDict[objectId];
          if (key in this.tileDict) {
            this.tileDict[key](state, [x, y]);
          } else {
            console.error('key <' + key + '> was not found.');
          }
        }
      }
    }
    state.dynamicState.lockGridKey = false;
    state.dynamicState.UpdateGridKeyString();
  }
}
