import { productService } from "../services/product.service.js";
import { asyncHandler } from "../middlewares/async-handler.js";

export const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getProducts();
  return res.status(200).json({ status: "success", payload: products });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.pid);
  return res.status(200).json({ status: "success", payload: product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return res.status(201).json({ status: "success", payload: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.pid, req.body);
  return res.status(200).json({ status: "success", payload: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.pid);
  return res.status(200).json({ status: "success", payload: product });
});
