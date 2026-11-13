import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity.js';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { ListMoviesQueryDto } from './dto/list-movies-query.dto.js';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movies: Repository<Movie>,
  ) {}

  findAll({ search, year, size, page }: ListMoviesQueryDto) {
    const where: FindOptionsWhere<Movie> = {};
    if (search) where.title = Like(`%${search}%`);
    if (year) where.year = year;

    return this.movies.findAndCount({
      order: { title: 'ASC', id: 'ASC' },
      where,
      take: size,
      skip: size * (page - 1),
    });
  }

  async findOne(id: number) {
    const movie = await this.movies.findOne({
      where: { id },
      relations: { files: true },
    });
    if (!movie) throw new NotFoundException(`Movie with ID ${id} not found `);
    return movie;
  }
}
