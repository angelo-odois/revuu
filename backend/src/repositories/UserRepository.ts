import { Repository, EntityManager } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { User } from "../entities/index.js";

export class UserRepository {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByIdWithSelect(id: string, select: (keyof User)[]): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      select,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepo.create(userData);
    return this.userRepo.save(user);
  }

  async save(user: User): Promise<User> {
    return this.userRepo.save(user);
  }

  async deleteWithAllData(userId: string): Promise<void> {
    await AppDataSource.transaction(async (manager: EntityManager) => {
      // Delete profile
      await manager.query("DELETE FROM profiles WHERE user_id = $1", [userId]);
      // Delete experiences
      await manager.query("DELETE FROM experiences WHERE user_id = $1", [userId]);
      // Delete education
      await manager.query("DELETE FROM educations WHERE user_id = $1", [userId]);
      // Delete skills
      await manager.query("DELETE FROM skills WHERE user_id = $1", [userId]);
      // Delete projects
      await manager.query("DELETE FROM projects WHERE user_id = $1", [userId]);
      // Delete pages
      await manager.query("DELETE FROM pages WHERE created_by = $1", [userId]);
      // Delete assets
      await manager.query("DELETE FROM assets WHERE uploaded_by = $1", [userId]);
      // Finally delete the user
      await manager.query("DELETE FROM users WHERE id = $1", [userId]);
    });
  }
}

export const userRepository = new UserRepository();
