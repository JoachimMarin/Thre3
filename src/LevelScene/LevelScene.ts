import * as Phaser from 'phaser';

import LevelState from 'LevelScene/LevelState';
import Item from 'GameObjects/PrePlaced/Item';
import ItemType from 'Constants/ItemType';
import ImageKey from 'Constants/ImageKey';
import Tile from 'Constants/Tile';
import { IVec2 } from 'Math/GridPoint';

import ImageDefinitions from 'Constants/Definitions/ImageDefinitions';
import ItemDefinitions from 'Constants/Definitions/ItemDefinitions';
import TileDefinitions from 'Constants/Definitions/TileDefinitions';
import CameraManager from './CameraManager';
import SideUserInterfaceScene from './SideUserInterfaceScene';
import GridUserInterfaceScene from './GridUserInterfaceScene';
import LevelList from 'Constants/Definitions/LevelList';
import Solver from './Solver';

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
class LevelParser {
  private tileDict: {
    [key: string]: (point: IVec2, grid: LevelState) => void;
  } = {};

  private scenes: Phaser.Scene[];
  private levelScene: LevelScene;
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

  RegisterTile(key: string, fun: (point: IVec2, grid: LevelState) => void) {
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
        (point, grid) => new Item(point, grid, itemType)
      );
    }

    for (const imageKey of ImageKey.ALL) {
      this.RegisterAsset(imageKey.imageKey);
    }

    this.levelScene.load.xml('tiles', 'assets/tiles.tsx');
    this.levelScene.load.xml(
      LevelList[LevelScene.SCENE.index].fileName,
      'assets/levels/' + LevelList[LevelScene.SCENE.index].fileName + '.tmx'
    );
  }

  LoadLevelInfo() {
    /**
     * Loads level information from the loaded .tsx and .tmx files.
     */
    this.tilesFile = new TilesFile(this.levelScene.cache.xml.get('tiles'));
    this.levelFile = new LevelFile(
      this.levelScene.cache.xml.get(LevelList[LevelScene.SCENE.index].fileName)
    );
  }

  BuildLevel(grid: LevelState) {
    /**
     * Fills the grid with tiles as specified by the loaded .tsx and .tmx files.
     * @param grid:
     */
    grid.lockGridKey = true;
    for (let y = 0; y < this.levelFile.height; y++) {
      for (let x = 0; x < this.levelFile.width; x++) {
        for (const objectId of this.levelFile.objects[x][y]) {
          const key = this.tilesFile.tileDict[objectId];
          if (key in this.tileDict) {
            this.tileDict[key]([x, y], grid);
          } else {
            console.error('key <' + key + '> was not found.');
          }
        }
      }
    }
    grid.lockGridKey = false;
    grid.ComputeGridString();

    return grid;
  }
}

export default class LevelScene extends Phaser.Scene {
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private grid: LevelState;
  private levelParser: LevelParser;
  public cameraManager: CameraManager;
  private ready: boolean = false;
  private additionalScenes: Phaser.Scene[];

  public static readonly SCENE = new LevelScene();

  public index: integer = 0;

  private constructor() {
    super('level');
    this.additionalScenes = [
      SideUserInterfaceScene.SCENE,
      GridUserInterfaceScene.SCENE
    ];
    this.levelParser = new LevelParser(this, []);
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  preload() {
    this.levelParser.Preload();
  }

  changeSceneToLevel(current: Phaser.Scene, index: integer) {
    this.index = index;
    current.scene.start(this);
  }

  restartLevel() {
    this.loadLevel();
  }

  changeToNextLevel() {
    const next = this.index + 1;
    if (next < LevelList.length) {
      this.changeSceneToLevel(this, next);
    } else {
      console.log('you won all levels');
    }
  }

  loadLevel() {
    if (this.grid != null) {
      this.grid.Remove();
    }
    this.levelParser.LoadLevelInfo();
    this.grid = new LevelState(
      this,
      this.levelParser.levelFile.width,
      this.levelParser.levelFile.height
    );
    this.levelParser.BuildLevel(this.grid);
    this.cameraManager = new CameraManager(this.grid);
    const solver = new Solver(this.grid);
    solver.ReportVictoryPaths();
  }

  createReady() {
    this.loadLevel();
    this.ready = true;
  }

  create() {
    this.ready = false;
    for (const scene of this.additionalScenes) {
      this.scene.launch(scene);
    }

    // wait until additional scenes have run "create"
    // this allows us to fully interact with them
    // for example accessing their cameras with CameraManager
    const waitForScenes = setInterval(() => {
      for (const scene of this.additionalScenes) {
        if (this.scene.getStatus(scene) != 5) {
          return;
        }
      }

      clearInterval(waitForScenes);
      this.createReady();
    }, 5);
  }

  update(_time: number, delta: number) {
    if (this.ready) {
      this.grid.Update(delta);
    }
  }
}
