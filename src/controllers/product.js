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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProduct = exports.getProducts = exports.getProduct = exports.deleteProduct = exports.createProduct = void 0;
const product_1 = require("../services/product");
const customResponse_1 = require("../utils/customResponse");
const error_handle_1 = require("../utils/error.handle");
const getProducts = (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ body }, res) {
    try {
        const { page = 1, limit = 10, filerValue } = body;
        const { data, pagination } = yield (0, product_1.getAllProducts)(page, limit, filerValue);
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 200,
            data: data.length ? data : undefined,
            message: "Lista de productos",
            pagination: pagination,
        });
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, "ERROR_GET_PRODUCTS");
    }
});
exports.getProducts = getProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield (0, product_1.getProductById)(+id);
        if (!product) {
            return (0, error_handle_1.handleHttp)(res, "PRODUCT_NOT_FOUND", 404);
        }
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 200,
            data: product,
            message: "Producto encontrado",
        });
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, "ERROR_GET_PRODUCT");
    }
});
exports.getProduct = getProduct;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield (0, product_1.createProductService)(req.body);
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 201,
            data: product,
            message: "Producto creado correctamente",
        });
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, "ERROR_CREATE_PRODUCT", error);
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { body } = req;
        const product = yield (0, product_1.updateProductService)(+id, body);
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 200,
            data: true,
            message: "Producto actualizado correctamente",
        });
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, "ERROR_UPDATE_PRODUCT");
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ params }, res) {
    try {
        const { id } = params;
        const product = yield (0, product_1.deleteProductService)(+id);
        (0, customResponse_1.customResponse)({
            res,
            statusCode: 200,
            message: "Producto eliminado correctamente",
            data: true,
        });
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, "ERROR_DELETE_PRODUCT");
    }
});
exports.deleteProduct = deleteProduct;
