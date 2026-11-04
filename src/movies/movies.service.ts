import { Injectable } from '@nestjs/common';

@Injectable()
export class MoviesService {
  findAll() {
    return `This action returns all movies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} movie`;
  }
}
