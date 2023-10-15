export default class ImageKey {
  public readonly imageKey: string;

  constructor(imageKey: string) {
    this.imageKey = imageKey;
    ImageKey.ALL.add(this);
  }
  static readonly ALL = new Set<ImageKey>();
}
