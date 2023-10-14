import ImageDefinitions from 'Constants/Definitions/ImageDefinitions';
import ItemDefinitions from 'Constants/Definitions/ItemDefinitions';
import LevelList from 'Constants/Definitions/LevelList';
import TileDefinitions from 'Constants/Definitions/TileDefinitions';
import ImageKey from 'Constants/ImageKey';
import ItemType from 'Constants/ItemType';
import Tile from 'Constants/Tile';
import Item from 'GameObjects/PrePlaced/Item';
import LevelScene from 'Level/LevelScene';
import { IVec2 } from 'Math/GridPoint';
import LevelState from './LevelState';

/**
 * TilesFile parses the .tsx file from the Tiled level editor.
 * This file contains a mapping from image path to tile id.
 */
class TilesFile {
  public tileDict: { [key: integer]: string } = {};

  constructor(data: XMLDocument) {
    const tilesets = data.getElementsByTagName('tileset');
    const tileset = tilesets[0];
    const tiles = tileset.getElementsByTagName('tile');
    for (const tile of tiles) {
      const id = parseInt(tile['id']) + 1;
      const images = tile.getElementsByTagName('image');
      const image = images[0];
      const source: string = image.getAttribute('source');
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

  constructor(data: XMLDocument) {
    const tilemaps = data.getElementsByTagName('map');
    const tilemap = tilemaps[0];

    const layers = tilemap.getElementsByTagName('layer');
    for (const layer of layers) {
      this.width = Math.max(this.width, parseInt(layer.getAttribute('width')));
      this.height = Math.max(
        this.height,
        parseInt(layer.getAttribute('height'))
      );
    }

    this.objects = [];
    for (let x = 0; x < this.width; x++) {
      this.objects[x] = [];
      for (let y = 0; y < this.height; y++) {
        this.objects[x][y] = [];
      }
    }
    for (const layer of layers) {
      const data = layer.getElementsByTagName('data');
      const dataContent = data[0].innerHTML;
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

/**
 * LevelParser handles asset management for level scenes. This includes:
 *  image files
 *  .tsx file @see TilesFile
 *  .tmx file @see LevelFile
 */
export default class LevelParser {
  private tileDict: {
    [key: string]: (state: LevelState, point: IVec2) => void;
  } = {};

  private scenes: Phaser.Scene[];
  private levelScene: LevelScene;

  public levelIndex: integer;
  public tilesFile: TilesFile;
  public levelFile: LevelFile;

  constructor(levelScene: LevelScene, additionalScenes: Phaser.Scene[]) {
    this.levelScene = levelScene;
    this.scenes = [levelScene as Phaser.Scene].concat(additionalScenes);
  }

  ImportAssets(..._args: object[]) {}

  RegisterAsset(key: string) {
    for (const scene of this.scenes) {
      scene.load.image(key, 'assets/' + key + '.png');
    }
  }

  RegisterTile(key: string, fun: (state: LevelState, point: IVec2) => void) {
    this.tileDict[key] = fun;
  }

  Preload() {
    this.ImportAssets(TileDefinitions, ImageDefinitions, ItemDefinitions);

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

    this.levelScene.load.xml('tiles', 'assets/tiles.tsx');
    for (let i = 0; i < LevelList.length; i++) {
      this.levelScene.load.xml(
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
    this.tilesFile = new TilesFile(this.levelScene.cache.xml.get('tiles'));
    this.levelFile = new LevelFile(
      this.levelScene.cache.xml.get(LevelList[levelIndex].fileName)
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
