import express from 'express';
import { generateRandomAlias } from './utils/aliasUtils.js';
import { urlStore, accessStore } from './store.js';
import { createCircularBuffer, scheduleTTL } from './utils/urlUtils.js';

const router = express.Router();

router.post('/shorten', async (req, res) => {
    try {
        const { long_url, custom_alias, ttl_seconds = 120 } = req.body;

        let alias = custom_alias || generateRandomAlias();

        if (custom_alias && urlStore.has(custom_alias)) {
            return res.status(400).json({ error: 'Custom alias already in use' });
        }

        const expiresAt = Date.now() + ttl_seconds * 1000;

        while (urlStore.has(alias)) {
            alias = generateRandomAlias();
        }

        urlStore.set(alias, { long_url, expiresAt });
        accessStore.set(alias, { access_count: 0, access_times: createCircularBuffer(10) });

        scheduleTTL(alias, expiresAt);

        res.json({ short_url: `http://localhost:3000/${alias}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:alias', async (req, res) => {
    try {
        const { alias } = req.params;
        const urlData = urlStore.get(alias);

        if (!urlData || urlData.expiresAt < Date.now()) {
            return res.status(404).send('Alias does not exist or has expired');
        }

        const accessData = accessStore.get(alias);
        accessData.access_count += 1;
        accessData.access_times.push(new Date().toISOString());

        res.redirect(urlData.long_url);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/analytics/:alias', async (req, res) => {
    try {
        const { alias } = req.params;
        const urlData = urlStore.get(alias);

        if (!urlData || urlData.expiresAt < Date.now()) {
            return res.status(404).send('Alias does not exist or has expired');
        }

        const accessData = accessStore.get(alias);
        res.json({
            alias,
            long_url: urlData.long_url,
            access_count: accessData.access_count,
            access_times: accessData.access_times.getItems()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/update/:alias', async (req, res) => {
    try {
        const { alias } = req.params;
        const { custom_alias, ttl_seconds = 120 } = req.body;

        const urlData = urlStore.get(alias);

        if (custom_alias && urlStore.has(custom_alias)) {
            return res.status(400).json({ error: 'Custom alias already in use' });
        }

        if (!urlData || urlData.expiresAt < Date.now()) {
            return res.status(404).send('Alias does not exist or has expired');
        }

        if (custom_alias) {
            urlStore.delete(alias);
            accessStore.delete(alias);
        }

        const new_alias = custom_alias || alias;
        const expiresAt = Date.now() + ttl_seconds * 1000;
        urlStore.set(new_alias, { ...urlData, expiresAt });
        accessStore.set(new_alias, { access_count: 0, access_times: createCircularBuffer(10) });
        scheduleTTL(new_alias, expiresAt);
        res.json({ short_url: `http://localhost:3000/${new_alias}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/delete/:alias', async (req, res) => {
    try {
        const { alias } = req.params;

        if (!urlStore.has(alias)) {
            return res.status(404).send('Alias does not exist or has expired');
        }

        urlStore.delete(alias);
        accessStore.delete(alias);
        res.json({ message: 'Alias deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
