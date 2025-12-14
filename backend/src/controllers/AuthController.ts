import { Request, Response } from "express";
import { userService } from "../services/UserService.js";

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password, username } = req.body;

    const result = await userService.register({
      name,
      email,
      password,
      username,
    });

    res.status(201).json({
      ...result.tokens,
      user: result.user,
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const result = await userService.login(email, password);

    res.json({
      ...result.tokens,
      user: result.user,
    });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken, userId } = req.body;

    const tokens = await userService.refreshToken(userId, refreshToken);

    res.json(tokens);
  }

  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (req.user) {
      await userService.logout(req.user.userId, refreshToken);
    }

    res.json({ message: "Logout realizado com sucesso" });
  }

  async me(req: Request, res: Response): Promise<void> {
    const user = await userService.getCurrentUser(req.user!.userId);
    res.json(user);
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;

    await userService.changePassword(req.user!.userId, currentPassword, newPassword);

    res.json({ message: "Senha alterada com sucesso" });
  }

  async updateAvatar(req: Request, res: Response): Promise<void> {
    const { avatarUrl } = req.body;

    const newAvatarUrl = await userService.updateAvatar(req.user!.userId, avatarUrl);

    res.json({ message: "Avatar atualizado", avatarUrl: newAvatarUrl });
  }

  async completeOnboarding(req: Request, res: Response): Promise<void> {
    await userService.completeOnboarding(req.user!.userId);

    res.json({ message: "Onboarding concluido", onboardingCompleted: true });
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    const { password } = req.body;

    await userService.deleteAccount(req.user!.userId, password);

    res.json({ message: "Conta excluida com sucesso" });
  }
}

export const authController = new AuthController();
