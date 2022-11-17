import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "ResetPassword"})
export class ResetPassword {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column({
        unique: true
    })
    token!: string;
}