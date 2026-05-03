// oxlint-disable no-extend-native
Map.prototype.getOrInsert = function getOrInsert(key, defaultValue) {
  if (!this.has(key)) this.set(key, defaultValue);
  return this.get(key);
};
Map.prototype.getOrInsertComputed = function getOrInsertComputed(key, fn) {
  if (!this.has(key)) this.set(key, fn(key));
  return this.get(key);
};
WeakMap.prototype.getOrInsert = function getOrInsert(key, defaultValue) {
  if (!this.has(key)) this.set(key, defaultValue);
  return this.get(key);
};
WeakMap.prototype.getOrInsertComputed = function getOrInsertComputed(key, fn) {
  if (!this.has(key)) this.set(key, fn(key));
  return this.get(key);
};
