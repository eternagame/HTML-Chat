export function random<Item>(list: Item[]): Item {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * @param list Assumed to be already sorted
 */
export function sortedInsert<Item>(
  list: Item[],
  item: Item,
  comparatorFn: (a: Item, b: Item) => number,
): void {
  if (list.length === 0 || comparatorFn(item, list.at(-1)!) >= 0) {
    // Quickly insert if list is empty or item belongs at the end
    list.push(item);
    return;
  } else if (comparatorFn(item, list.at(0)!) < 0) {
    // Quickly insert if item belongs at the start
    list.unshift(item);
    return;
  }

  // Find the insertion position if item belongs in the middle
  let low = 0;
  let high = list.length;
  while (low < high) {
    const mid = (low + high) >>> 1;

    if (comparatorFn(item, list[mid]) < 0) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  // Insert item into found position
  list.splice(low, 0, item);
}
