import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrailsController } from './trails.controller';
import { TrailsService } from './trails.service';
import { Trail, TrailSchema } from './schemas/trail.schema';
import { MockTrailDataProvider } from './providers/mock-trail-data.provider';
import { OsmTrailDataProvider } from './providers/osm-trail-data.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trail.name, schema: TrailSchema }]),
  ],
  controllers: [TrailsController],
  providers: [TrailsService, MockTrailDataProvider, OsmTrailDataProvider],
  exports: [TrailsService, MockTrailDataProvider, OsmTrailDataProvider],
})
export class TrailsModule {}
