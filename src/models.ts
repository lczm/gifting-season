import { Table, Column, Model } from "sequelize-typescript";

@Table({ timestamps: false })
export class Staff extends Model {
  @Column({ primaryKey: true })
  staff_pass_id!: string;

  @Column
  team_name!: string;

  @Column
  created_at!: number;
}

@Table({ timestamps: false })
export class Redemption extends Model {
  @Column
  team_name!: string;

  @Column
  redeemed_at!: number;
}
