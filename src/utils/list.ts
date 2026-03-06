export function random<Item>(list: Item[]): Item {
  return list[Math.floor(Math.random() * list.length)];
}
