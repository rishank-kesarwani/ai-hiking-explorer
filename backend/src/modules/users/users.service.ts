import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserPreference, UserPreferenceDocument } from './schemas/user-preference.schema';
import { UpdateProfileDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserPreference.name) private readonly userPreferenceModel: Model<UserPreferenceDocument>,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel({
      ...userData,
      email: userData.email?.toLowerCase().trim(),
    });
    const savedUser = await createdUser.save();

    // Create default user preferences
    await this.userPreferenceModel.create({
      userId: savedUser._id,
      favoriteTags: [],
      defaultLocation: { city: 'Delhi', coordinates: [77.209, 28.6139] },
      customGearChecklist: [],
    });

    return savedUser;
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateDto },
      { new: true },
    ).select('-passwordHash -refreshTokenHash').exec();

    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }

  async setRefreshToken(userId: string, hashedRefreshToken: string | null): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      refreshTokenHash: hashedRefreshToken,
    }).exec();
  }

  async getPreferences(userId: string): Promise<UserPreferenceDocument> {
    let pref = await this.userPreferenceModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!pref) {
      pref = await this.userPreferenceModel.create({
        userId: new Types.ObjectId(userId),
        favoriteTags: [],
        defaultLocation: { city: 'Delhi', coordinates: [77.209, 28.6139] },
        customGearChecklist: [],
      });
    }
    return pref;
  }

  async updatePreferences(
    userId: string,
    updates: Partial<UserPreference>,
  ): Promise<UserPreferenceDocument> {
    const updated = await this.userPreferenceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: updates },
      { new: true, upsert: true },
    ).exec();
    return updated;
  }
}
