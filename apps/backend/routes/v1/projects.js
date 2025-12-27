import express from 'express';
import {
  createProject,
  fetchProjectsByUserId,
  fetchProjectById
} from '../../controllers/projects.js';

const router = express.Router();

router.get('/user', fetchProjectsByUserId);
router.get('/:projectId', fetchProjectById);
router.post('/create', createProject);

export default router;

