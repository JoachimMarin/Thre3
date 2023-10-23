import Constants from 'Game/Constants';
import GridObjectStatic from 'Game/Level/GameObjects/BaseClasses/GridObjectStatic';
import DynamicState from 'Game/Level/GameState/DynamicState';
import StaticState from 'Game/Level/GameState/StaticState';
import { IVec2, Vec2 } from 'Utils/Math/GridPoint';

export default class GridObjectStaticImage extends GridObjectStatic {
  protected image: Phaser.GameObjects.Image;

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
    if (Constants.INCLUDE_GRAPHICS && this.image !== undefined) {
      this.image.destroy();
      this.image = undefined;
    }
  }

  override Unload() {
    super.Unload();
    if (Constants.INCLUDE_GRAPHICS && this.image !== undefined) {
      this.image.destroy();
      this.image = undefined;
    }
  }
}
