import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "User"})
export class User {
    @PrimaryGeneratedColumn()
    id!: number;
    //test
    @Column()
    first_name!: string;

    @Column()
    last_name!: string;

    @Column({
        unique: true
    })
    email!: string;

    @Column()
    password!: string;

    @Column({
        default: ""
    })
    tfa_secret!: string;
}