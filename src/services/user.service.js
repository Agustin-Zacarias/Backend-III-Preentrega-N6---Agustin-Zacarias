import { userRepository } from "../repositories/user.repository.js";
import { USER_ROLES } from "../constants/index.js";
import logger from "../logger/logger.js";
import {
  DuplicateEmailError,
  InvalidIdentifierError,
  UserNotFoundError,
  ValidationError,
} from "../errors/app-error.js";

const isValidId = (id) => typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);

const validateId = (id) => {
  if (!isValidId(id)) throw new InvalidIdentifierError("usuario");
};

const validateUser = (userData, isUpdate = false) => {
  if (!userData || typeof userData !== "object" || Array.isArray(userData)) {
    throw new ValidationError("El cuerpo de la solicitud debe ser un objeto JSON.");
  }

  const { firstName, lastName, email, password, role } = userData;

  if (!isUpdate) {
    const requiredFieldsAreValid =
      typeof firstName === "string" && firstName.trim() &&
      typeof lastName === "string" && lastName.trim() &&
      typeof email === "string" && email.trim() &&
      typeof password === "string" && password.length > 0;

    if (!requiredFieldsAreValid) {
      throw new ValidationError("Nombre, apellido, email y contraseña son obligatorios.");
    }
  } else {
    if (firstName !== undefined && (typeof firstName !== "string" || !firstName.trim())) {
      throw new ValidationError("El nombre debe ser un texto no vacío.");
    }
    if (lastName !== undefined && (typeof lastName !== "string" || !lastName.trim())) {
      throw new ValidationError("El apellido debe ser un texto no vacío.");
    }
    if (password !== undefined && (typeof password !== "string" || !password)) {
      throw new ValidationError("La contraseña debe ser un texto no vacío.");
    }
  }

  if (email !== undefined && (
    typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  )) {
    throw new ValidationError("El email no tiene un formato válido.");
  }

  if (role !== undefined && !Object.values(USER_ROLES).includes(role)) {
    throw new ValidationError("El rol indicado no es válido.");
  }
};

export const userService = {
  getUsers: () => userRepository.findAll(),

  getUserById: async (id) => {
    validateId(id);
    const user = await userRepository.findById(id);
    if (!user) throw new UserNotFoundError();
    return user;
  },

  createUser: async (userData = {}) => {
    validateUser(userData);
    const email = userData.email.trim().toLowerCase();

    if (await userRepository.findByEmail(email)) {
      throw new DuplicateEmailError();
    }

    const user = await userRepository.create({
      ...userData,
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email,
      role: userData.role ?? USER_ROLES.USER,
    });
    logger.info("Usuario creado correctamente.", {
      userId: user?._id?.toString(),
      role: user?.role,
    });
    return user;
  },

  updateUser: async (id, userData = {}) => {
    validateId(id);
    const currentUser = await userRepository.findById(id);
    if (!currentUser) throw new UserNotFoundError();

    validateUser(userData, true);
    const updatedData = { ...userData };

    if (updatedData.email !== undefined) {
      updatedData.email = updatedData.email.trim().toLowerCase();
      const userWithEmail = await userRepository.findByEmail(updatedData.email);
      if (userWithEmail && userWithEmail._id.toString() !== id) {
        throw new DuplicateEmailError();
      }
    }
    if (updatedData.firstName !== undefined) updatedData.firstName = updatedData.firstName.trim();
    if (updatedData.lastName !== undefined) updatedData.lastName = updatedData.lastName.trim();

    const user = await userRepository.update(id, updatedData);
    logger.info("Usuario actualizado correctamente.", { userId: id });
    return user;
  },

  deleteUser: async (id) => {
    validateId(id);
    const user = await userRepository.delete(id);
    if (!user) throw new UserNotFoundError();
    logger.info("Usuario eliminado correctamente.", { userId: id });
    return user;
  },
};
