import Tile from 'Constants/Tile';
import Player from 'GameObjects/PrePlaced/Player';
import BlueWall from 'GameObjects/PrePlaced/BlueWall';
import ProtectiveWall from 'GameObjects/PrePlaced/ProtectiveWall';
import Goal from 'GameObjects/PrePlaced/Goal';
import LaserGun, { LaserColor } from 'GameObjects/PrePlaced/LaserGun';
import DirtWall from 'GameObjects/PrePlaced/DirtWall';

const TileDefinitions = {
  PLAYER: new Tile(Player.imageKey, (point, grid) => new Player(point, grid)),
  BLUE_WALL: new Tile(
    BlueWall.imageKey,
    (point, grid) => new BlueWall(point, grid)
  ),
  PROTECTIVE_WALL: new Tile(
    ProtectiveWall.imageKey,
    (point, grid) => new ProtectiveWall(point, grid)
  ),
  GOAL: new Tile(Goal.imageKey, (point, grid) => new Goal(point, grid)),

  LASERS: (() => {
    const r = new Map<LaserColor, Tile>();
    for (const color of LaserColor.ALL) {
      r.set(
        color,
        new Tile(color.gunImageKey, (point, grid) => {
          return new LaserGun(point, grid, color);
        })
      );
    }
    return r;
  })(),

  DIRT_WALL: new Tile(
    DirtWall.imageKey,
    (point, grid) => new DirtWall(point, grid)
  )
};

export default TileDefinitions;
