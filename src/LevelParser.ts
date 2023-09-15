import LevelScene from 'LevelScene';
import GridObject from 'GridObjects/GridObject';
import LevelGrid from 'LevelGrid';
import Item from 'GridObjects/PrePlaced/Item';
import ItemType from 'Constants/ItemType';
import ImageKey from 'Constants/ImageKey';
import Tile from 'Constants/Tile';

import ImageDefinitions from 'Constants/Definitions/ImageDefinitions';
import ItemDefinitions from 'Constants/Definitions/ItemDefinitions';
import TileDefinitions from 'Constants/Definitions/TileDefinitions';

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

    console.log(this.tileDict);
  }
}

class LevelFile {
  public readonly width: integer = 0;
  public readonly height: integer = 0;
  public readonly objects: integer[][][] = [];

  constructor(data: XMLDocument) {
    console.log(data);
    const tilemaps = data.getElementsByTagName('map');
    console.log(tilemaps);
    const tilemap = tilemaps[0];
    console.log(tilemap);

    const layers = tilemap.getElementsByTagName('layer');
    console.log(layers);
    for (const layer of layers) {
      this.width = Math.max(this.width, parseInt(layer.getAttribute('width')));
      this.height = Math.max(
        this.height,
        parseInt(layer.getAttribute('height'))
      );
    }
    console.log(this.width);
    console.log(this.height);

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
    console.log(this.objects);
  }
}

export default class LevelParser {
  private level_scene: LevelScene;
  private tileDict: {
    [key: string]: (x: integer, y: integer, grid: LevelGrid) => GridObject;
  } = {};

  ImportAssets(..._args: object[]) {}

  RegisterAsset(key: string) {
    this.level_scene.load.image(key, 'assets/' + key + '.png');
  }

  RegisterSheet(key: string, width: integer) {
    this.level_scene.load.spritesheet(key, 'assets/' + key + '.png', {
      frameWidth: width
    });
  }

  RegisterTile(
    key: string,
    fun: (x: integer, y: integer, grid: LevelGrid) => GridObject
  ) {
    this.tileDict[key] = fun;
  }

  Preload(level_scene: LevelScene) {
    this.level_scene = level_scene;

    this.ImportAssets(TileDefinitions, ImageDefinitions, ItemDefinitions);

    for (const tile of Tile.ALL) {
      this.RegisterTile(tile.imageKey, tile.fun);
    }

    for (const itemType of ItemType.ALL) {
      this.RegisterTile(
        itemType.imageKey,
        (x, y, grid) => new Item(x, y, grid, itemType)
      );
    }

    for (const imageKey of ImageKey.ALL) {
      this.RegisterAsset(imageKey.imageKey);
    }

    this.level_scene.load.xml('tiles', 'assets/tiles.tsx');
    this.level_scene.load.xml(
      'level',
      'assets/levels/level' + this.level_scene.index + '.tmx'
    );
  }

  BuildLevel() {
    const tilesFile = new TilesFile(this.level_scene.cache.xml.get('tiles'));
    const levelFile = new LevelFile(this.level_scene.cache.xml.get('level'));
    const grid = new LevelGrid(
      this.level_scene,
      levelFile.width,
      levelFile.height
    );

    for (let y = 0; y < levelFile.height; y++) {
      for (let x = 0; x < levelFile.width; x++) {
        for (const objectId of levelFile.objects[x][y]) {
          const key = tilesFile.tileDict[objectId];
          if (key in this.tileDict) {
            this.tileDict[key](x, y, grid);
          } else {
            console.error('key <' + key + '> was not found.');
          }
        }
      }
    }

    return grid;
  }
}
