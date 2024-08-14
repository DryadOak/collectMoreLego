import express from 'express';
import { getLogin, postLogin, logout, getSignup, postSignup } from '../controllers/auth.js';
import { getIndex } from '../controllers/home.js';
import { ensureAuth} from '../middleware/auth.js';

const router = express.Router();

router.get('/', getIndex);
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/logout', logout);
router.get('/signup', getSignup);
router.post('/signup', postSignup);

export default router;
