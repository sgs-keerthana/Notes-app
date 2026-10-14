import { DataTypes, Model, type Sequelize } from "sequelize";
import { sequelize } from "../db/database.js";
export class TenantModel extends Model {
    declare id: string;
    declare name: string;
}
export const initializeTenantModel =(sequelize: Sequelize): void=>{
    TenantModel.init(
        {
            id:{
                type: DataTypes.STRING(32),
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
        },
        {
            sequelize,
            tableName: "tenants",
            timestamps: false,
        }
    );
};