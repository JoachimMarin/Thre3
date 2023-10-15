export default class Level {
  public readonly fileName: string;
  public readonly levelName: string;

  constructor(fileName: string, levelName: string) {
    this.fileName = fileName;
    this.levelName = levelName;
  }
}
