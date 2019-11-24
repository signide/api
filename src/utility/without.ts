/**
 * Removes each element in 'values' from 'array'.
 * Throws an error if not all 'values' can be removed;
 *
 * @param array - The array
 * @param values - The values to remove
 * @returns The new array
 */
export function without(array: any[], values: any[]): any[] {
  const copy = [...values];

  const newArray = array.reduce((acc, curr) => {
    const indexOfRemoval = copy.findIndex(value => {
      return value === curr;
    });
    if (indexOfRemoval > -1) {
      copy.splice(indexOfRemoval, 1);
      return acc;
    }
    return [...acc, curr];
  }, []);

  if (copy.length > 0) {
    throw new Error("'array' must contain each value in 'values'.");
  }

  return newArray;
}
