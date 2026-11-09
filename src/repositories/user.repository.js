import UserModel from "../models/user.model.js";

// Las consultas devuelven siempre los mismos campos públicos y no exponen
// la contraseña. El orden también queda definido en esta capa.
const PUBLIC_USER_FIELDS = "firstName lastName email role createdAt updatedAt";

export const userRepository = {
  findAll: async () => {
    return UserModel.find()
      .select(PUBLIC_USER_FIELDS)
      .sort({ createdAt: -1 })
      .lean();
  },

  findById: async (id) => {
    return UserModel.findById(id).select(PUBLIC_USER_FIELDS).lean();
  },

  findByEmail: async (email) => {
    return UserModel.findOne({ email }).select("_id").lean();
  },

  create: async (userData) => {
    const user = await UserModel.create(userData);
    return UserModel.findById(user._id).select(PUBLIC_USER_FIELDS).lean();
  },

  update: async (id, userData) => {
    return UserModel.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    })
      .select(PUBLIC_USER_FIELDS)
      .lean();
  },

  delete: async (id) => {
    return UserModel.findByIdAndDelete(id).select(PUBLIC_USER_FIELDS).lean();
  },
};
