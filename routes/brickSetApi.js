import express from "express";
import expressLayouts from 'express-ejs-layouts'
import dotenv from 'dotenv';
import { searchBricksetAPI } from '../controllers/brickSetApi.js'

const router = express.Router();

router.use(expressLayouts);
dotenv.config();

router.get('/search', searchBricksetAPI);

export default router;