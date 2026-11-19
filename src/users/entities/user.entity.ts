import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  Admin = 'admin',
  User = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({ type: 'simple-enum', enum: Role, default: Role.User })
  role!: Role;

  @Column({ type: 'integer', select: false, default: 0 })
  tokenVersion!: number;
}
