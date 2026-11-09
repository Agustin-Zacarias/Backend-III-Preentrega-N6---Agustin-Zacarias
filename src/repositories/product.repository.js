import ProductModel from "../models/product.model.js";
import { PRODUCT_STATUS } from "../constants/index.js";

// El repository centraliza la proyección, el orden y los filtros de consulta.
const PRODUCT_FIELDS = "name description price stock status createdAt updatedAt";
const VALID_STATUS_FILTER = {
  status: { $in: Object.values(PRODUCT_STATUS) },
};

export const productRepository = {
  findAll: async () => {
    return ProductModel.find(VALID_STATUS_FILTER)
      .select(PRODUCT_FIELDS)
      .sort({ createdAt: -1 })
      .lean();
  },

  findById: async (id) => {
    return ProductModel.findOne({ _id: id, ...VALID_STATUS_FILTER })
      .select(PRODUCT_FIELDS)
      .lean();
  },

  create: async (productData) => {
    const product = await ProductModel.create(productData);
    return ProductModel.findById(product._id).select(PRODUCT_FIELDS).lean();
  },

  update: async (id, productData) => {
    return ProductModel.findOneAndUpdate(
      { _id: id, ...VALID_STATUS_FILTER },
      productData,
      { new: true, runValidators: true },
    )
      .select(PRODUCT_FIELDS)
      .lean();
  },

  delete: async (id) => {
    return ProductModel.findOneAndDelete({ _id: id, ...VALID_STATUS_FILTER })
      .select(PRODUCT_FIELDS)
      .lean();
  },
};
