export class RingBuffer {
    constructor(names) {
        this._buffer = [...names];
    }

    shift() {
        const tmp = this._buffer[this._buffer.length - 1];
        for (let i = this._buffer.length - 1; i > 1; i--) {
            this._buffer[i] = this._buffer[i - 1];
        }
        this._buffer[1] = tmp;
    }

    get buffer() {
        return this._buffer;
    }

    getOpposites() {
        const results = [];
        for (let i = 0; i < Math.floor(this._buffer.length / 2); i++) {
            results.push([this._buffer[i], this._buffer[this._buffer.length - 1 - i]]);
        }
        return results;
    }
}
