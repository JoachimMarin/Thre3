import { Direction } from '../Constants/Direction';

export default class GridPoint {
  public readonly x: integer;
  public readonly y: integer;

  constructor(x: integer, y: integer) {
    this.x = x;
    this.y = y;
  }

  realX() {
    return this.x * 128 + 64;
  }

  realY() {
    return this.y * 128 + 64;
  }

  Add(other: GridPoint) {
    return new GridPoint(this.x + other.x, this.y + other.y);
  }

  Negate() {
    return new GridPoint(-this.x, -this.y);
  }

  Subtract(other: GridPoint) {
    return new GridPoint(this.x - other.x, this.y - other.y);
  }

  Multiply(factor: integer) {
    return new GridPoint(factor * this.x, factor * this.y);
  }

  Angle() {
    return (Math.atan2(this.y, this.x) * 180) / Math.PI;
  }

  static Zero() {
    return new GridPoint(0, 0);
  }

  static DirectionToAngle(direction: Direction) {
    return this.TranslationVector(direction).Angle();
  }

  static TranslationVector(direction: Direction, length: integer = 1) {
    switch (direction) {
      case Direction.UP:
        return new GridPoint(0, -length);
      case Direction.LEFT:
        return new GridPoint(-length, 0);
      case Direction.DOWN:
        return new GridPoint(0, length);
      case Direction.RIGHT:
        return new GridPoint(length, 0);
      default:
        return new GridPoint(0, 0);
    }
  }

  Translate(direction: Direction, length: integer = 1) {
    return this.Add(GridPoint.TranslationVector(direction, length));
  }
}
