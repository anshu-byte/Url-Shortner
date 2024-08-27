import {ttlHeap, urlStore, accessStore} from '../store.js'

function createCircularBuffer(size) {
    const buffer = new Array(size);
    let writeIndex = 0;
    let itemCount = 0;

    return {
        push(item) {
            buffer[writeIndex] = item;
            writeIndex = (writeIndex + 1) % size;
            if (itemCount < size) {
                itemCount++;
            }
        },
        getItems() {
            if (itemCount < size) {
                return buffer.slice(0, itemCount);
            }
            return [...buffer.slice(writeIndex), ...buffer.slice(0, writeIndex)];
        }
    };
}

function scheduleTTL(alias, expiresAt) {
    ttlHeap.insert({ alias, expiresAt });
}

function cleanUpExpiredURLs() {
    const now = Date.now();
    while (!ttlHeap.isEmpty() && ttlHeap.peek().expiresAt <= now) {
        const { alias } = ttlHeap.removeMin();
        urlStore.delete(alias);
        accessStore.delete(alias);
    }
}

setInterval(cleanUpExpiredURLs, 1000);

export { createCircularBuffer, scheduleTTL };
