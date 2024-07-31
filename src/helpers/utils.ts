import { Document } from 'mongoose';

export class Utils {
  public static excludeAttribute(attributesToExclude: string[]) {
    const exclude = attributesToExclude.reduce((excl, attr) => {
      excl[attr] = 0;
      return excl;
    }, {});
    return exclude;
  }

  public static attributesToExclude(
    result: Document,
    attributesToExclude: string[],
  ) {
    const resultObj = result.toObject();
    attributesToExclude.forEach((attr) => {
      delete resultObj[attr];
    });
    return resultObj;
  }
}
