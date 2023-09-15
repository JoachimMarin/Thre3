import Tile from 'Constants/Tile';
import Player from 'GridObjects/PrePlaced/Player';
import BlueWall from 'GridObjects/PrePlaced/BlueWall';
import ProtectiveWall from 'GridObjects/PrePlaced/ProtectiveWall';
import Goal from 'GridObjects/PrePlaced/Goal';
import LaserGun, { LaserColor } from 'GridObjects/PrePlaced/LaserGun';

const TileDefinitions = {
  PLAYER: new Tile(Player.imageKey, (x, y, grid) => new Player(x, y, grid)),
  BLUE_WALL: new Tile(
    BlueWall.imageKey,
    (x, y, grid) => new BlueWall(x, y, grid)
  ),
  PROTECTIVE_WALL: new Tile(
    ProtectiveWall.imageKey,
    (x, y, grid) => new ProtectiveWall(x, y, grid)
  ),
  GOAL: new Tile(Goal.imageKey, (x, y, grid) => new Goal(x, y, grid)),

  LASERS: (() => {
    const r = new Map<LaserColor, Tile>();
    for (const color of LaserColor.ALL) {
      r.set(
        color,
        new Tile(color.gunImageKey, (x, y, grid) => {
          return new LaserGun(x, y, grid, color);
        })
      );
    }
    return r;
  })()
};

export default TileDefinitions;
