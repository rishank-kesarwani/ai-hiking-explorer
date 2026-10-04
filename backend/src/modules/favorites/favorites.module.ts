import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { FavoriteTrail, FavoriteTrailSchema } from './schemas/favorite-trail.schema';
import { SavedHike, SavedHikeSchema } from './schemas/saved-hike.schema';
import { TrailsModule } from '../trails/trails.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FavoriteTrail.name, schema: FavoriteTrailSchema },
      { name: SavedHike.name, schema: SavedHikeSchema },
    ]),
    TrailsModule,
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
