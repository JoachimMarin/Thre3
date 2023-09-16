export default class Direction {
  private angle: integer;

  private constructor(angle: integer) {
    this.angle = angle;
  }

  ToAngle() {
    return this.angle;
  }

  static readonly RIGHT = new Direction(0);
  static readonly UP = new Direction(270);
  static readonly LEFT = new Direction(180);
  static readonly DOWN = new Direction(90);
}
