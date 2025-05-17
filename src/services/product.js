"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductService = exports.updateProductService = exports.createProductService = exports.getProductById = exports.getAllProducts = void 0;
const product_1 = __importDefault(require("../models/product"));
const sequelize_filter_util_1 = require("../utils/sequelize-filter.util");
const getAllProducts = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, filterValue = "") {
    const offset = (page - 1) * limit;
    const whereClause = (0, sequelize_filter_util_1.generateWhereClause)(product_1.default, filterValue);
    const { count: total, rows: data } = yield product_1.default.findAndCountAll({
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
});
exports.getAllProducts = getAllProducts;
const getProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield product_1.default.findByPk(id);
});
exports.getProductById = getProductById;
const createProductService = (productData) => __awaiter(void 0, void 0, void 0, function* () {
    const newProduct = yield product_1.default.create(productData);
    return newProduct;
});
exports.createProductService = createProductService;
const updateProductService = (id, productData) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_1.default.findByPk(id);
    if (!product)
        return null;
    yield product.update(productData);
    return product;
});
exports.updateProductService = updateProductService;
const deleteProductService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_1.default.findByPk(id);
    if (!product)
        return false;
    yield product.destroy();
    return true;
});
exports.deleteProductService = deleteProductService;
