import { IVec2, Vec2 } from 'Utils/Math/GridPoint';
import GridObjectStatic from 'Game/Level/GameObjects/BaseClasses/GridObjectStatic';
import DynamicState from 'Game/Level/GameState/DynamicState';
import IImage from 'PhaserStubs/IImage';
import StaticState from 'Game/Level/GameState/StaticState';
import Constants from 'Game/Constants';

export default class GridObjectStaticImage extends GridObjectStatic {
  protected image: IImage = null;

  constructor(
    state: StaticState,
    aPoint: IVec2,
    imageKey: string,
    displayWidth: number = 1,
    displayHeight: number = 1
  ) {
    super(state, aPoint);

    if (Constants.INCLUDE_GRAPHICS) {
      const point = Vec2.AsVec2(aPoint);
      this.image = state.levelScene.add.image(
        point.realX(),
        point.realY(),
        imageKey
      );
      this.image.setDisplaySize(displayWidth, displayHeight);
    }
  }

  override Remove(state: DynamicState): void {
    super.Remove(state);
    if (Constants.INCLUDE_GRAPHICS) {
      this.image.destroy();
      this.image = null;
    }
  }

  override Unload() {
    super.Unload();
    if (Constants.INCLUDE_GRAPHICS) {
      this.image.destroy();
      this.image = null;
    }
  }
}
