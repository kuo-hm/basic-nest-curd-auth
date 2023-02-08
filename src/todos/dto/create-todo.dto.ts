import { IsBoolean, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  task: string;

  @IsBoolean()
  status: boolean;

  @IsString()
  userId: string;
}
