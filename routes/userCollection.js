import express from "express";
import dotenv from 'dotenv';
import asyncHandler from "express-async-handler";
import * as userCollectionController from '../controllers/userCollection.js'

const router = express.Router();

dotenv.config();


router.post('/addToCollection', asyncHandler(async (req, res) => {
    await userCollectionController.addItemToDataBase(req, res, 'CollectionItem');
}));


router.post('/addToWishList', asyncHandler(async (req, res) => {
    await userCollectionController.addItemToDataBase(req, res, 'WishlistItem');
}));

router.delete('/deleteItem', asyncHandler(async (req, res) => {
    await userCollectionController.removeItemFromDataBase(req, res);
}));

router.put('/updateItem', asyncHandler(async (req, res) => {
    await userCollectionController.updateItemInDataBase(req, res);
}));

router.get('/myCollection', asyncHandler(async (req, res) => {
        await userCollectionController.getUserCollection(req, res)
}));

router.get('/myWishlist', asyncHandler(async (req, res) => {
         await userCollectionController.getUserWishlist(req, res)
}));

router.get('/', asyncHandler(async (req, res) => {
         await userCollectionController.getLegoThemes(req, res)
}));

router.post('/sortResults', asyncHandler(async (req, res) => {
         await userCollectionController.sortLegoCollection(req, res)
}));
export default router;