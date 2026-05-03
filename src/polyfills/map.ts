Map.prototype.getOrInsert = function (key, defaultValue) {
  if (!this.has(key)) this.set(key, defaultValue);
  return this.get(key);
};
Map.prototype.getOrInsertComputed = function (key, cb) {
  if (!this.has(key)) this.set(key, cb(key));
  return this.get(key);
};
