import express from 'express';
import {
  createProject,
  fetchProjectsByUserId,
  fetchProjectById
} from '../../controllers/projects.js';
import { validate } from '../../middleware/validation.js';
import {
  createProjectSchema,
  projectParamsSchema,
} from '../../validation/schemas.js';

const router = express.Router();

router.get('/user', fetchProjectsByUserId);
router.get('/:projectId', validate(projectParamsSchema), fetchProjectById);
router.post('/create', validate(createProjectSchema), createProject);

export default router;

