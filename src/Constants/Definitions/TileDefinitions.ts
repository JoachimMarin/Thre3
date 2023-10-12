import Tile from 'Constants/Tile';
import Player from 'GameObjects/PrePlaced/Player';
import BlueWall from 'GameObjects/PrePlaced/BlueWall';
import ProtectiveWall from 'GameObjects/PrePlaced/ProtectiveWall';
import Goal from 'GameObjects/PrePlaced/Goal';
import LaserGun, { LaserColor } from 'GameObjects/PrePlaced/LaserGun';
import DirtWall from 'GameObjects/PrePlaced/DirtWall';
import { Vec2 } from 'Math/GridPoint';
import ObjectTag from 'Constants/ObjectTag';
import LevelState from 'LevelScene/LevelState';

class SimpleTile extends Tile {
  constructor(imageKey: string, ...tags: ObjectTag[]) {
    super(imageKey, (point, grid) => {
      const vec2 = Vec2.AsVec2(point);
      const gridKey = LevelState.GridKeyPoint(vec2);
      if (!grid.staticTags.has(gridKey)) {
        grid.staticTags.set(gridKey, new Set<ObjectTag>());
      }
      for (const tag of tags) {
        grid.staticTags.get(gridKey).add(tag);
      }
      if (!grid.virtual) {
        const image = grid.levelScene.add.image(
          vec2.realX(),
          vec2.realY(),
          imageKey
        );
        image.setDisplaySize(1, 1);
        grid.staticImages.push(image);
      }
    });
  }
}

const TileDefinitions = {
  PLAYER: new Tile(Player.imageKey, (point, grid) => new Player(point, grid)),
  BLUE_WALL: new SimpleTile(BlueWall.imageKey, ObjectTag.WALL),
  PROTECTIVE_WALL: new SimpleTile(
    ProtectiveWall.imageKey,
    ObjectTag.WALL,
    ObjectTag.DESTROY_BULLETS
  ),
  GOAL: new SimpleTile(Goal.imageKey, ObjectTag.GOAL),

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
