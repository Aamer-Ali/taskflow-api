import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: { owner: true } });
  }

  async findOne(id: number): Promise<Project> {
    const whereCriteria: FindOptionsWhere<Project> = { id: id };
    const project = await this.projectRepository.findOne({
      where: whereCriteria,
      relations: { owner: true, tasks: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return project;
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return await this.projectRepository.save(project);
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<UpdateProjectDto> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  async remove(id: number): Promise<void> {
    const project = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const taskCriteria: FindOptionsWhere<Task> = {
        projectId: project.id,
      };

      // await queryRunner.manager.delete(Task, { projectId: project.id });
      await queryRunner.manager.delete(Task, taskCriteria);
      await queryRunner.manager.remove(Project, project);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.projectRepository.remove(project);
  }
}
