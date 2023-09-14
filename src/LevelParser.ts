import LevelScene from "./LevelScene";
import GridObject from "./GridObjects/GridObject";
import LaserColor from "./Constants/LaserColor";
import Player from "./GridObjects/Player";
import LevelGrid from "./LevelGrid";
import BlueWall from "./GridObjects/BlueWall";
import ProtectiveWall from "./GridObjects/ProtectiveWall";
import LaserGun from "./GridObjects/LaserGun";
import Goal from "./GridObjects/Goal";

export class TilesFile {
    public tileDict: { [key: integer]: string } = {};

    constructor(data: XMLDocument) {
        const tilesets = data.getElementsByTagName("tileset");
        const tileset = tilesets[0];
        const tiles = tileset.getElementsByTagName("tile");
        for (const tile of tiles) {
            const id = parseInt(tile["id"]) + 1;
            const images = tile.getElementsByTagName("image");
            const image = images[0];
            const source: string = image.getAttribute("source");
            this.tileDict[id] = source.substring(0, source.length - 4);
        }

        console.log(this.tileDict);
    }
}

export class LevelFile {
    public readonly width: integer = 0;
    public readonly height: integer = 0;
    public readonly objects: integer[][][] = [];

    constructor(data: XMLDocument) {
        console.log(data);
        const tilemaps = data.getElementsByTagName("map");
        console.log(tilemaps);
        const tilemap = tilemaps[0];
        console.log(tilemap);

        const layers = tilemap.getElementsByTagName("layer");
        console.log(layers);
        for (const layer of layers) {
            this.width = Math.max(this.width, parseInt(layer.getAttribute("width")));
            this.height = Math.max(this.height, parseInt(layer.getAttribute("height")));
        }
        console.log(this.width);
        console.log(this.height);

        this.objects = [];
        for (var x = 0; x < this.width; x++) {
            this.objects[x] = [];
            for (var y = 0; y < this.height; y++) {
                this.objects[x][y] = [];
            }
        }
        for (const layer of layers) {
            const data = layer.getElementsByTagName("data");
            const dataContent = data[0].innerHTML;
            const rawData = dataContent.replace("\n", "").replace("\r", "").split(",");
            var i = 0;
            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    var idAt = parseInt(rawData[i]);
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

export class LevelParser {
    private level_scene: LevelScene;
    private tileDict: { [key: string]: (x: integer, y: integer, grid: LevelGrid) => GridObject } = {};

    RegisterAsset(key: string) {
        this.level_scene.load.image(key, "assets/" + key + ".png");
    }

    RegisterSheet(key: string, width: integer) {
        this.level_scene.load.spritesheet(key, "assets/" + key + ".png", {frameWidth: width});
    }

    RegisterTile(key: string, fun: (x: integer, y: integer, grid: LevelGrid) => GridObject) {
        this.RegisterAsset(key);
        this.tileDict[key] = fun;
    }

    Preload(level_scene: LevelScene) {
        this.level_scene = level_scene;

        this.RegisterTile('player', (x, y, grid) => new Player(x, y, grid));
        this.RegisterTile('blue_wall', (x, y, grid) => new BlueWall(x, y, grid));
        this.RegisterTile('protective_wall', (x, y, grid) => new ProtectiveWall(x, y, grid));
        this.RegisterTile('goal', (x, y, grid) => new Goal(x, y, grid));
        this.RegisterSheet('goal_sheet', 256);

        for (const color of LaserColor.ALL) {
            this.RegisterTile(color.name + '_gun', (x, y, grid) => new LaserGun(x, y, grid, color));
            this.RegisterAsset(color.name + '_projectile');
            this.RegisterAsset(color.name + '_projectile_end');
        }

        this.level_scene.load.xml('tiles', 'assets/tiles.tsx');
        this.level_scene.load.xml('level', 'assets/levels/level' + this.level_scene.index + '.tmx');
    }

    BuildLevel() {
        const tilesFile = new TilesFile(this.level_scene.cache.xml.get('tiles'));
        const levelFile = new LevelFile(this.level_scene.cache.xml.get('level'));
        const grid = new LevelGrid(this.level_scene, levelFile.width, levelFile.height);


        for (var y = 0; y < levelFile.height; y++) {
            for (var x = 0; x < levelFile.width; x++) {
                for (const objectId of levelFile.objects[x][y]) {
                    const key = tilesFile.tileDict[objectId];
                    console.log(key);
                    this.tileDict[key](x, y, grid);
                }
            }
        }

        return grid;
    }
}
