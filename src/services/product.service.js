import { productRepository } from "../repositories/product.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";
import logger from "../logger/logger.js";
import {
  InvalidIdentifierError,
  ProductNotFoundError,
  ValidationError,
} from "../errors/app-error.js";

const isValidId = (id) => typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

const validateId = (id) => {
  if (!isValidId(id)) throw new InvalidIdentifierError("producto");
};

const validateProduct = (productData) => {
  if (!productData || typeof productData !== "object" || Array.isArray(productData)) {
    throw new ValidationError("El cuerpo de la solicitud debe ser un objeto JSON.");
  }

  const { name, description, price, stock } = productData;

  if (typeof name !== "string" || !name.trim()) {
    throw new ValidationError("El nombre del producto es obligatorio.");
  }
  if (description !== undefined && typeof description !== "string") {
    throw new ValidationError("La descripción debe ser un texto.");
  }
  if (price === undefined || price === null || price === "" ||
      !Number.isFinite(Number(price)) || Number(price) <= 0) {
    throw new ValidationError("El precio debe ser un número mayor que cero.");
  }
  if (stock === undefined || stock === null || stock === "" ||
      !Number.isInteger(Number(stock)) || Number(stock) < 0) {
    throw new ValidationError("El stock debe ser un número entero igual o mayor que cero.");
  }
};

// La regla de negocio que relaciona stock y estado pertenece al Service.
const getStatusFromStock = (stock) =>
  Number(stock) > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;

export const productService = {
  getProducts: () => productRepository.findAll(),

  getProductById: async (id) => {
    validateId(id);
    const product = await productRepository.findById(id);
    if (!product) throw new ProductNotFoundError();
    return product;
  },

  createProduct: async (productData = {}) => {
    validateProduct(productData);
    const product = await productRepository.create({
      name: productData.name.trim(),
      description: productData.description?.trim() ?? "",
      price: Number(productData.price),
      stock: Number(productData.stock),
      status: getStatusFromStock(productData.stock),
    });
    logger.info("Producto creado correctamente.", { productId: product?._id?.toString() });
    return product;
  },

  updateProduct: async (id, productData = {}) => {
    validateId(id);
    if (!productData || typeof productData !== "object" || Array.isArray(productData)) {
      throw new ValidationError("El cuerpo de la solicitud debe ser un objeto JSON.");
    }

    const currentProduct = await productRepository.findById(id);
    if (!currentProduct) throw new ProductNotFoundError();

    const updatedData = {
      name: productData.name ?? currentProduct.name,
      description: productData.description ?? currentProduct.description,
      price: productData.price ?? currentProduct.price,
      stock: productData.stock ?? currentProduct.stock,
    };

    validateProduct(updatedData);
    const product = await productRepository.update(id, {
      ...updatedData,
      name: updatedData.name.trim(),
      description: updatedData.description.trim(),
      price: Number(updatedData.price),
      stock: Number(updatedData.stock),
      status: getStatusFromStock(updatedData.stock),
    });
    logger.info("Producto actualizado correctamente.", { productId: id });
    return product;
  },

  deleteProduct: async (id) => {
    validateId(id);
    const product = await productRepository.delete(id);
    if (!product) throw new ProductNotFoundError();
    logger.info("Producto eliminado correctamente.", { productId: id });
    return product;
  },
};
