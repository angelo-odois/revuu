import { Repository } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { User, Page } from "../entities/index.js";

export class SubscriptionRepository {
  private userRepo: Repository<User>;
  private pageRepo: Repository<Page>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
    this.pageRepo = AppDataSource.getRepository(Page);
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findUserByIdWithSelect(id: string, select: (keyof User)[]): Promise<User | null> {
    return this.userRepo.findOne({ where: { id }, select });
  }

  async countUserPortfolios(userId: string): Promise<number> {
    return this.pageRepo.count({
      where: { createdBy: { id: userId } },
    });
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepo.save(user);
  }
}

export const subscriptionRepository = new SubscriptionRepository();
