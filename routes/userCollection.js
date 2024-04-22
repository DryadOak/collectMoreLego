import express from "express";
import dotenv from 'dotenv';
import asyncHandler from "express-async-handler";


import { UserLegoSet, WishlistItem, CollectionItem, LegoTheme } from '../models/legoSetModel.js';
const router = express.Router();



dotenv.config();


const addItemToDataBase = async (req, res, itemModel) => {
    const legoSet = req.body.set;

    // Ensure that required fields are present
    if (!legoSet || !legoSet.setID || !legoSet.name || !legoSet.number) {
        return res.status(400).json({ error: 'Invalid Lego set data.' });
    }

    const existingItem = await itemModel.findOne({ setID: legoSet.setID });
    if (existingItem) {
        return res.status(400).json({ error: `Lego set with the same setID already exists in the ${itemModel.modelName}.` });
    }

    const newItem = new itemModel(legoSet);
    const result = await newItem.save();
    console.log('Document saved successfully:', result);

    res.send(result);
};

const removeItemFromDataBase = async (req, res) => {
    
    const {set} = req.body; 
    const itemId = set._id; 
    const deletedItem = await UserLegoSet.findByIdAndDelete(itemId);
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
}

const updateItemInDataBase = async (req, res) => {
    
    const {set} = req.body; 
    const itemId = set._id;
    const schema = set.__t == 'CollectionItem' ? CollectionItem : WishlistItem;
    const updatedItem = await schema.findByIdAndUpdate(itemId, set, { new: true });
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item updated successfully' });
}

const sortResults = async (req, res, legoObjects) => {
    try {
        const sets = legoObjects.sets;
        if (!Array.isArray(sets)) {
            throw new Error('Lego sets array is missing or not an array');
        }

        const sortOption = req.body.sortBy;
        console.log(sortOption)
        const [sortKey, sortOrder] = sortOption.split('_');

       const compareFunction = (a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            // If one of the objects doesn't have the property, handle it as a special case
            if (aValue === undefined || bValue === undefined) {
                // Decide the order based on whether aValue or bValue is undefined
                if (aValue === undefined && bValue !== undefined) {
                    return sortOrder === 'asc' ? 1 : -1; // Object without the property comes after
                } else if (aValue !== undefined && bValue === undefined) {
                    return sortOrder === 'asc' ? -1 : 1; // Object without the property comes before
                } else {
                    return 0; // Both objects don't have the property, consider them equal
                }
            }

            // If sortKey is "number", handle numeric string comparison
            if (sortKey === 'number') {
                // Convert values to numbers if they are numeric strings
                const aNumber = /^\d+$/.test(aValue) ? parseFloat(aValue) : NaN;
                const bNumber = /^\d+$/.test(bValue) ? parseFloat(bValue) : NaN;

                // Compare numbers if both values are numeric strings, otherwise, fallback to string comparison
                if (!isNaN(aNumber) && !isNaN(bNumber)) {
                    if (sortOrder === 'asc') {
                        return aNumber - bNumber;
                    } else if (sortOrder === 'desc') {
                        return bNumber - aNumber;
                    }
                }
            }

            // If not "number" or not numeric strings, fall back to string comparison
            if (sortOrder === 'asc') {
                if (aValue < bValue) return -1;
                if (aValue > bValue) return 1;
                return 0;
            } else if (sortOrder === 'desc') {
                if (aValue > bValue) return -1;
                if (aValue < bValue) return 1;
                return 0;
            } else {
                throw new Error('Invalid sortOrder');
            }
        };


        // Sort the sets array using the comparison function
        const sortedSets = sets.sort(compareFunction);
        return legoObjects;
    } catch (error) {
        throw new Error(`Failed to sort results: ${error.message}`);
    }
};




router.post('/addToCollection', asyncHandler(async (req, res) => {
    await addItemToDataBase(req, res, CollectionItem);
}));


router.post('/addToWishList', asyncHandler(async (req, res) => {
    await addItemToDataBase(req, res, WishlistItem);
}));

router.delete('/deleteItem', asyncHandler(async (req, res) => {
    await removeItemFromDataBase(req, res);
}));

router.put('/updateItem', asyncHandler(async (req, res) => {
    console.log(req.body.set)
    await updateItemInDataBase(req, res);
}));


const fetchItemsFromDB = async (req, res, itemModel) => {
    const items = await itemModel.find();
        if (items.length > 0) {
            const legoObject = {
                status: 'success',
                matches: items.length,
                sets: items,
            };

            return legoObject
        } else {
            console.log(`cant fetch ${itemModel.modelName}`)
            return res.status(400).json({ error: `Can not get ${itemModel.modelName} from the data base.` });
        }
}
router.get(
    '/myCollection', 
    asyncHandler(async (req, res, next) => {
        const legoObject = await fetchItemsFromDB(req, res, CollectionItem);
        res.render('myCollection', { legoObject: legoObject, currentPage: '/myCollection'})
    }),
);

router.get(
    '/myWishList', 
    asyncHandler(async (req, res, next) => {
         const legoObject = await fetchItemsFromDB(req, res, WishlistItem);
         res.render('myWishlist', { legoObject: legoObject, currentPage: '/myWishList'})
    }),
);

router.get(
    '/themes', 
    asyncHandler(async (req, res, next) => {
        const legoThemesObject = await fetchItemsFromDB(req, res, LegoTheme);
        res.render('brickSetThemes', { legoObject: legoThemesObject });
    }),
)

router.post(
    '/sortResults',
    asyncHandler(async (req, res, next) => {
        const currentPage = req.query.currentPage;
        const sortBy = req.body.sortBy;

        console.log('Current Page:', currentPage);
        console.log('Sort By:', sortBy);

        // Determine the item type based on the current page
        let itemType;
        if (currentPage === 'myCollection') {
            itemType = CollectionItem;
        } else if (currentPage === 'myWishList') {
            itemType = WishlistItem;
        } else {
            throw new Error('Invalid current page');
        }

        // Fetch items from the database based on the current page
        const legoObjects = await fetchItemsFromDB(req, res, itemType);

        // Sort the fetched items
        const sortedLegoObjects = await sortResults(req, res, legoObjects);
        console.log('Sorted Lego Objects:', sortedLegoObjects);

        // Render the sorted results using EJS or send as JSON
        const formattedCurrentPage = `/${currentPage}`;
        console.log('Formatted Current Page:', formattedCurrentPage);
        res.render(`${currentPage}`, { legoObject: sortedLegoObjects, currentPage: formattedCurrentPage, sortBy: sortBy });
    })
);
export default router;