import mongoose from "mongoose";
import connection from "../database/connect";
const crypto = require('crypto');
import { UserDocument } from "./user.model";

export interface ProductInput {
    user: UserDocument["_id"];
    title: string;
    description: string,
    price: number,
    image: string,
}

export interface ProductDocument extends ProductInput, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
            unique: true,
            default: () => `product_${crypto.randomUUID()}`
        },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        title: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
    },
    { timestamps: true }
);

const ProductModel = connection.model<ProductDocument>("Product", ProductSchema);

export default ProductModel;
