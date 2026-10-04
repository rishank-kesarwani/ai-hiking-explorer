import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FavoriteTrail, FavoriteTrailDocument } from './schemas/favorite-trail.schema';
import { SavedHike, SavedHikeDocument, HikeStatus } from './schemas/saved-hike.schema';
import { TrailsService } from '../trails/trails.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(FavoriteTrail.name) private readonly favoriteModel: Model<FavoriteTrailDocument>,
    @InjectModel(SavedHike.name) private readonly savedHikeModel: Model<SavedHikeDocument>,
    private readonly trailsService: TrailsService,
  ) {}

  async toggleFavorite(userId: string, trailIdOrSlug: string) {
    const trail = await this.trailsService.getTrailById(trailIdOrSlug);
    const realTrailId = (trail as any)._id || trailIdOrSlug;

    const existing = await this.favoriteModel.findOne({
      userId: new Types.ObjectId(userId),
      trailId: new Types.ObjectId(realTrailId),
    }).exec();

    if (existing) {
      await this.favoriteModel.findByIdAndDelete(existing._id).exec();
      return { isFavorite: false, message: 'Trail removed from favorites' };
    } else {
      await this.favoriteModel.create({
        userId: new Types.ObjectId(userId),
        trailId: new Types.ObjectId(realTrailId),
      });
      return { isFavorite: true, message: 'Trail saved to favorites' };
    }
  }

  async getFavorites(userId: string) {
    const favorites = await this.favoriteModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('trailId')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return favorites.map((f) => ({
      _id: f._id,
      trail: f.trailId,
      createdAt: (f as any).createdAt,
    }));
  }

  async isFavorite(userId: string, trailIdOrSlug: string): Promise<boolean> {
    try {
      const trail = await this.trailsService.getTrailById(trailIdOrSlug);
      const realTrailId = (trail as any)._id || trailIdOrSlug;

      const existing = await this.favoriteModel.findOne({
        userId: new Types.ObjectId(userId),
        trailId: new Types.ObjectId(realTrailId),
      }).exec();

      return !!existing;
    } catch {
      return false;
    }
  }

  async saveHike(userId: string, data: { trailIdOrSlug: string; status?: HikeStatus; scheduledDate?: string; notes?: string }) {
    const trail = await this.trailsService.getTrailById(data.trailIdOrSlug);
    const realTrailId = (trail as any)._id || data.trailIdOrSlug;

    const saved = await this.savedHikeModel.create({
      userId: new Types.ObjectId(userId),
      trailId: new Types.ObjectId(realTrailId),
      status: data.status || HikeStatus.PLANNED,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
      notes: data.notes || '',
    });

    return saved.populate('trailId');
  }

  async getSavedHikes(userId: string, status?: HikeStatus) {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (status) query.status = status;

    return this.savedHikeModel
      .find(query)
      .populate('trailId')
      .sort({ scheduledDate: -1, createdAt: -1 })
      .lean()
      .exec();
  }

  async removeSavedHike(userId: string, id: string) {
    const res = await this.savedHikeModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    }).exec();

    if (!res) throw new NotFoundException('Saved hike entry not found');
    return { success: true, message: 'Saved hike removed' };
  }
}
