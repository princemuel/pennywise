Map.prototype.getOrInsert = function (key, value) {
	if (!this.has(key)) this.set(key, value);
	return this.get(key);
};
Map.prototype.getOrInsertComputed = function (key, fn) {
	if (!this.has(key)) this.set(key, fn(key));
	return this.get(key);
};
WeakMap.prototype.getOrInsert = function (key, value) {
	if (!this.has(key)) this.set(key, value);
	return this.get(key);
};
WeakMap.prototype.getOrInsertComputed = function (key, fn) {
	if (!this.has(key)) this.set(key, fn(key));
	return this.get(key);
};
