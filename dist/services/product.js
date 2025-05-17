"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductService = exports.updateProductService = exports.createProductService = exports.getProductById = exports.getAllProducts = void 0;
const product_1 = __importDefault(require("../models/product"));
const sequelize_filter_util_1 = require("../utils/sequelize-filter.util");
const getAllProducts = async (page = 1, limit = 10, filterValue = "") => {
    const offset = (page - 1) * limit;
    const whereClause = (0, sequelize_filter_util_1.generateWhereClause)(product_1.default, filterValue);
    const { count: total, rows: data } = await product_1.default.findAndCountAll({
        where: whereClause,
        offset,
        limit,
    });
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
    };
};
exports.getAllProducts = getAllProducts;
const getProductById = async (id) => {
    return await product_1.default.findByPk(id);
};
exports.getProductById = getProductById;
const createProductService = async (productData) => {
    const newProduct = await product_1.default.create(productData);
    return newProduct;
};
exports.createProductService = createProductService;
const updateProductService = async (id, productData) => {
    const product = await product_1.default.findByPk(id);
    if (!product)
        return null;
    await product.update(productData);
    return product;
};
exports.updateProductService = updateProductService;
const deleteProductService = async (id) => {
    const product = await product_1.default.findByPk(id);
    if (!product)
        return false;
    await product.destroy();
    return true;
};
exports.deleteProductService = deleteProductService;
