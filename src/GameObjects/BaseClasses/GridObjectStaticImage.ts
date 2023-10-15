import { IVec2, Vec2 } from 'Math/GridPoint';
import GridObjectStatic from './GridObjectStatic';
import StaticState from 'Level/StaticState';
import DynamicState from 'Level/DynamicState';
import IImage from 'Level/IImage';

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

    if (!state.virtual) {
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
    if (!state.virtual) {
      this.image.destroy();
      this.image = null;
    }
  }

  override Unload(virtual: boolean) {
    super.Unload(virtual);
    if (this.image != null) {
      this.image.destroy();
      this.image = null;
    }
  }
}
