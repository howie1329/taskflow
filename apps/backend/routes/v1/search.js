import express from 'express';
import { smartSearch } from '../../controllers/search.js';
import { validate } from '../../middleware/validation.js';
import { searchSchema } from '../../validation/schemas.js';

const router = express.Router();

router.post('/search', validate(searchSchema), smartSearch);

export default router;

