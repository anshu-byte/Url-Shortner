import Heap from 'heap';

class MinHeap {
    constructor() {
        this.heap = new Heap((a, b) => a.expiresAt - b.expiresAt);
    }

    insert(item) {
        this.heap.push(item);
    }

    removeMin() {
        return this.heap.pop();
    }

    peek() {
        return this.heap.peek();
    }

    isEmpty() {
        return this.heap.size() === 0;
    }
}

function createMinHeap() {
    return new MinHeap();
}

export { createMinHeap };
