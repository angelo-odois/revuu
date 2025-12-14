import { User } from "../entities/index.js";
import { userRepository } from "../repositories/UserRepository.js";
import { authService } from "./auth.js";
import { Errors } from "../middlewares/errorHandler.js";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  username: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  plan: string;
  subscriptionStatus: string;
}

class UserService {
  async register(dto: RegisterDTO): Promise<{ user: UserResponse; tokens: { accessToken: string; refreshToken: string } }> {
    this.validateRegistration(dto);

    // Check if email already exists
    const existingEmail = await userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw Errors.emailTaken(dto.email);
    }

    // Check if username already exists
    const existingUsername = await userRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw Errors.usernameTaken(dto.username);
    }

    // Create new user
    const passwordHash = await authService.hashPassword(dto.password);
    const user = await userRepository.create({
      name: dto.name,
      email: dto.email,
      username: dto.username,
      passwordHash,
      onboardingCompleted: false,
    });

    const tokens = await authService.generateTokens(user);

    return {
      user: this.mapUserResponse(user),
      tokens,
    };
  }

  async login(email: string, password: string): Promise<{ user: UserResponse; tokens: { accessToken: string; refreshToken: string } }> {
    if (!email || !password) {
      throw Errors.requiredField("email e senha");
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw Errors.invalidCredentials();
    }

    const isValid = await authService.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw Errors.invalidCredentials();
    }

    const tokens = await authService.generateTokens(user);

    return {
      user: this.mapUserResponse(user),
      tokens,
    };
  }

  async refreshToken(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken || !userId) {
      throw Errors.requiredField("refreshToken e userId");
    }

    const isValid = await authService.verifyRefreshToken(userId, refreshToken);
    if (!isValid) {
      throw Errors.tokenInvalid();
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw Errors.userNotFound(userId);
    }

    // Revoke old token and generate new ones
    await authService.revokeRefreshToken(userId, refreshToken);
    return authService.generateTokens(user);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken && userId) {
      await authService.revokeRefreshToken(userId, refreshToken);
    }
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await userRepository.findByIdWithSelect(userId, [
      "id", "name", "email", "role", "username", "avatarUrl",
      "onboardingCompleted", "createdAt", "plan", "subscriptionStatus",
    ]);

    if (!user) {
      throw Errors.userNotFound(userId);
    }

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!currentPassword || !newPassword) {
      throw Errors.requiredField("senha atual e nova senha");
    }

    if (newPassword.length < 6) {
      throw Errors.invalidFormat("nova senha", "minimo 6 caracteres");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw Errors.userNotFound(userId);
    }

    const isValid = await authService.verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw Errors.invalidCredentials({ reason: "senha atual incorreta" });
    }

    user.passwordHash = await authService.hashPassword(newPassword);
    await userRepository.save(user);
  }

  async updateAvatar(userId: string, avatarUrl: string | undefined): Promise<string | undefined> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw Errors.userNotFound(userId);
    }

    user.avatarUrl = avatarUrl || undefined;
    await userRepository.save(user);

    return user.avatarUrl;
  }

  async completeOnboarding(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw Errors.userNotFound(userId);
    }

    user.onboardingCompleted = true;
    await userRepository.save(user);
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    if (!password) {
      throw Errors.requiredField("senha");
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw Errors.userNotFound(userId);
    }

    const isValid = await authService.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw Errors.invalidCredentials({ reason: "senha incorreta" });
    }

    await userRepository.deleteWithAllData(userId);
    await authService.revokeAllRefreshTokens(userId);
  }

  // ==================== PRIVATE HELPERS ====================

  private validateRegistration(dto: RegisterDTO): void {
    if (!dto.name || !dto.email || !dto.password || !dto.username) {
      throw Errors.requiredField("nome, email, senha e username");
    }

    if (dto.password.length < 6) {
      throw Errors.stringTooLong("senha", 6);
    }

    const usernameRegex = /^[a-zA-Z0-9-]+$/;
    if (!usernameRegex.test(dto.username)) {
      throw Errors.invalidFormat("username", "apenas letras, numeros e hifens");
    }

    if (dto.username.length < 3 || dto.username.length > 30) {
      throw Errors.invalidFormat("username", "entre 3 e 30 caracteres");
    }
  }

  private mapUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      username: user.username,
      avatarUrl: user.avatarUrl,
      onboardingCompleted: user.onboardingCompleted,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
    };
  }
}

export const userService = new UserService();
