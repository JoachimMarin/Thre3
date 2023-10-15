import IImage from 'PhaserStubs/IImage';

export default abstract class ILevelScene {
  abstract Unload(): void;
  abstract changeToNextLevel(): void;
  abstract restartLevel(): void;
  add = {
    image: function (..._: any[]): IImage {
      return null;
    }
  };
  cursors = {
    up: null,
    down: null,
    left: null,
    right: null,
    space: null,
    shift: null
  };

  staticImages = [];
}
