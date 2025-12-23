import express from 'express';
import { smartSearch } from '../../controllers/search.js';

const router = express.Router();

router.post('/search', smartSearch);

export default router;

