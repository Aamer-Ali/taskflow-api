import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // GET /projects/:projectId/tasks
  @Get('projects/:projectId/tasks')
  findAll(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.tasksService.findAllByProject(projectId);
  }

  // POST /projects/:projectId/tasks
  @Post('projects/:projectId/tasks')
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(projectId, createTaskDto);
  }

  // PATCH /tasks/:id
  @Patch('tasks/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  // DELETE /tasks/:id
  @Roles(UserRole.ADMIN)
  @Delete('tasks/:id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
