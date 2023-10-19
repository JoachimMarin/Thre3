export default class Level {
  private static indexCounter: integer = 0;
  public readonly fileName: string;
  public readonly levelName: string;
  public readonly index: integer = Level.indexCounter++;

  constructor(fileName: string, levelName: string) {
    this.fileName = fileName;
    this.levelName = levelName;
  }
}
