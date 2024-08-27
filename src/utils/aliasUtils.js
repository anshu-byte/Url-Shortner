import { nanoid } from 'nanoid';

function generateRandomAlias() {
    return nanoid(8); 
}

export {generateRandomAlias}
