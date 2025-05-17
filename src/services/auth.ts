import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser } from "../interfaces/user.interface";
import { User } from "../models/user";

export const loginUser = async (username: string, password: string) => {
  const user = await User.findOne({ where: { username } });

  if (!user) throw new Error("Usuario no encontrado");

  const isMatch = await bcrypt.compare(password, user?.password);

  if (!isMatch) throw new Error("Contraseña incorrecta");

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  return { token, ...user };
};

export const createUser = async (
  userData: Omit<IUser, "id" | "created_at" | "updated_at" | "deleted_at">
) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = await User.create({ ...userData, password: hashedPassword });
  return newUser;
};
