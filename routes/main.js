import express from 'express';
import { getLogin, postLogin, logout, postSignup } from '../controllers/auth.js';
import { getIndex } from '../controllers/home.js';

const router = express.Router();

router.get('/', getIndex);
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/logout', logout);
// router.get('/signup', getSignup);
router.post('/signup', postSignup);

export default router;
