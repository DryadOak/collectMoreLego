import mongoose from "mongoose";

const Schema = mongoose.Schema;

const legoSetSchema = new Schema({
    setID: { type: String, required: true },
    number: { type: String, required: true },
    name: { type: String, required: true },
    year: Number,
    theme: String,
    subtheme: String,
    pieces: Number,
    minifigs: { type: Number, default: 0 },
    image: {
        thumbnailURL: String,
        imageURL: String
    },
    LEGOCom: {
        US: {
            retailPrice: Number,
            dateFirstAvailable: Date,
            dateLastAvailable: Date
        },
        UK: {
            retailPrice: Number,
            dateFirstAvailable: Date,
            dateLastAvailable: Date
        },
        CA: {
            retailPrice: Number,
            dateFirstAvailable: Date,
            dateLastAvailable: Date
        },
        DE: {
            retailPrice: Number,
            dateFirstAvailable: Date,
            dateLastAvailable: Date
        }
    },
    rating: Number,
    packagingType: String,
    availability: String,
    ageRange: {
        min: Number,
        max: Number
    },
    dimensions: {
        height: Number,
        width: Number,
        depth: Number,
        weight: Number
    },
    barcode: {
        EAN: String,
        UPC: String
    }
}, {timestamps: true});

// Wishlist document extends LegoSetSchema
const wishlistSchema = new Schema({
    priority: {
        type: Number,
        default: function() {
            return Math.floor(Date.now() / 1000);
        },
    },
});

// Collection document extends LegoSetSchema
const collectionSchema = new Schema({
    purchasePrice: {
        type: Number,
        default: function() {
            // Accessing the default UK retailPrice
            const ukRetailPrice = this.LEGOCom.UK.retailPrice;
            // Return UK retailPrice as default purchasePrice
            return ukRetailPrice || 1; // If UK retailPrice is not available, default to 1
        }
    },
     acquisitionDate: {
        type: String,
        default: function() {
            const currentDate = new Date();
            return currentDate.toISOString().split('T')[0];
        }
    }
});


const legoThemeSchema = new Schema({
    theme: { type: String, required: true },
    setCount: { type: Number, required: true },
    subthemeCount: { type: Number, default: 0 },
    yearFrom: Number,
    yearTo: Number,
    imageURL: {
        type: String,
        required: true,
        default: function() {
            return this.yearFrom < 1972 ? "/images/classic_logo.webp" : "/images/default_logo.svg"
        }
    },
    popular: {
        type: Boolean,
        required: true,
        default: false
    },
});



const UserLegoSet = mongoose.model("user-lego-set", legoSetSchema);
const WishlistItem = UserLegoSet.discriminator("WishlistItem", wishlistSchema);
const CollectionItem = UserLegoSet.discriminator("CollectionItem", collectionSchema);

const LegoTheme = mongoose.model("lego-theme", legoThemeSchema)
export { UserLegoSet, WishlistItem, CollectionItem, LegoTheme };