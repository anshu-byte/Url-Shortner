import { createMinHeap } from './utils/minHeap.js';

const urlStore = new Map();
const accessStore = new Map();
const ttlHeap = createMinHeap();

export { urlStore, accessStore, ttlHeap };
