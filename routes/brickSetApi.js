import express from "express";
import dotenv from 'dotenv';
import asyncHandler from "express-async-handler";
import expressLayouts from 'express-ejs-layouts';
import { LegoTheme } from '../models/legoSetModel.js';
import cron from 'node-cron'


const router = express.Router();

router.use(expressLayouts);
dotenv.config();

const APIkey = process.env.BRICKSET_API_KEY;
const baseURL = 'https://brickset.com/api/v3.asmx/'

router.get(
    '/search', 
    asyncHandler(async (req, res, next) => {
        const searchInput = req.query.searchInput;
        const pageSize = 21; 
        const pageNumber = parseInt(req.query.page) || 1;
        const orderBy = req.query.orderBy || 'RatingDESC';
        const bricksetApiResponse = await fetch(`${baseURL}getSets?apiKey=${APIkey}&userHash=&params={'query':'${searchInput}','orderBy':'${orderBy}','pageSize':${pageSize},'pageNumber':${pageNumber}}`);
        const bricksetApiData = await bricksetApiResponse.json();
        res.render('brickSetResults', { legoObject: bricksetApiData, searchInput: searchInput, pageNumber: pageNumber, pageSize: pageSize, orderBy: orderBy });
    }),
);

const updateThemesFromBricksetApi = async() => {
    try {
        const bricksetApiResponse = await fetch(`https://brickset.com/api/v3.asmx/getThemes?apiKey=${APIkey}`);
        const bricksetApiData = await bricksetApiResponse.json();

        if (bricksetApiData.status === 'success') {
            for (const theme of bricksetApiData.themes) {
                const existingTheme = await LegoTheme.findOne({ theme: theme.theme });
                if (existingTheme) {
                    // Update existing document
                    await LegoTheme.findOneAndUpdate(
                        { theme: theme.theme },
                        { $set: { setCount: theme.setCount, subthemeCount: theme.subthemeCount, yearFrom: theme.yearFrom, yearTo: theme.yearTo } },
                    );
                } else {
                    // Create new document
                    const newTheme = new LegoTheme({
                        theme: theme.theme,
                        setCount: theme.setCount,
                        subthemeCount: theme.subthemeCount,
                        yearFrom: theme.yearFrom,
                        yearTo: theme.yearTo,
                    });
                    await newTheme.save();
                }
            }
            console.log('Themes updated successfully');
        } else {
            console.log('Brickset API returned status:', bricksetApiData.status);
        }
    } catch (error) {
        console.error('Error updating themes:', error);
    }
}


// Schedule the function to run monthly
cron.schedule('0 0 1 * *', async () => {
    console.log('Running updateThemesFromBricksetApi...');
    await updateThemesFromBricksetApi();
});

export default router;