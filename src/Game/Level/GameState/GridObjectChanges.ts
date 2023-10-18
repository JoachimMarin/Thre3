import ByteArray from 'Utils/Math/ByteArray';

export default abstract class GridObjectChanges {
  static readonly REMOVED = 0;

  static GetByteArraySize() {
    return 4;
  }

  static WriteByteArray(
    byteArray: Uint8Array,
    index: integer,
    changes: integer
  ) {
    ByteArray.Write32(byteArray, index, changes);
  }

  static SetFlag(changes: integer, index: integer, flag: boolean): integer {
    if (flag) {
      return changes | (1 << index);
    } else {
      return changes & ~(1 << index);
    }
  }

  static HasFlag(changes: integer, index: integer): boolean {
    return (changes & (1 << index)) != 0;
  }
}
