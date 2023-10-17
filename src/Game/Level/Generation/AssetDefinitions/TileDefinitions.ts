import Player from 'Game/Level/GameObjects/PrePlaced/Player';
import LaserGun, {
  LaserColor
} from 'Game/Level/GameObjects/PrePlaced/LaserGun';
import DirtWall from 'Game/Level/GameObjects/PrePlaced/DirtWall';
import { Vec2 } from 'Utils/Math/GridPoint';
import ObjectTag from 'Game/Level/GameObjects/ObjectTag';
import Tile from 'Game/Level/Generation/AssetLoading/Tile';

class SimpleTile extends Tile {
  constructor(imageKey: string, ...tags: ObjectTag[]) {
    super(imageKey, (state, point) => {
      const vec2 = Vec2.AsVec2(point);
      const gridKey = vec2.toInt16();
      if (!state.staticState.staticTags.has(gridKey)) {
        state.staticState.staticTags.set(gridKey, new Set<ObjectTag>());
      }
      for (const tag of tags) {
        state.staticState.staticTags.get(gridKey).add(tag);
      }
      if (!state.virtual) {
        const image = state.levelScene.add.image(
          vec2.realX(),
          vec2.realY(),
          imageKey
        );
        image.setDisplaySize(1, 1);
        state.levelScene.staticImages.push(image);
      }
    });
  }
}

const TileDefinitions = {
  PLAYER: new Tile(
    Player.imageKey,
    (state, point) => new Player(point, state.dynamicState)
  ),
  BLUE_WALL: new SimpleTile('blue_wall', ObjectTag.WALL),
  PROTECTIVE_WALL: new SimpleTile(
    'protective_wall',
    ObjectTag.WALL,
    ObjectTag.DESTROY_BULLETS
  ),
  GOAL: new SimpleTile('goal', ObjectTag.GOAL),

  LASERS: (() => {
    const r = new Map<LaserColor, Tile>();
    for (const color of LaserColor.ALL) {
      r.set(
        color,
        new Tile(color.gunImageKey, (state, point) => {
          return new LaserGun(state.staticState, point, color);
        })
      );
    }
    return r;
  })(),

  DIRT_WALL: new Tile(
    DirtWall.imageKey,
    (state, point) => new DirtWall(state.staticState, point)
  )
};

export default TileDefinitions;
