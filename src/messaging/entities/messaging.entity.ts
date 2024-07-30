import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

@Schema({
  timestamps: true,
})
export class Messaging {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @ApiProperty({
    example: '63b38915ac985c7de8751ba3',
    required: true,
    description: 'The message sender',
  })
  sender: string;
}
