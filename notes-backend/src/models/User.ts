import { DataTypes,Model, Sequelize } from "sequelize";
export class UserModel extends Model {
    declare id: string;
    declare email: string;
    declare passwordHash: string;
    declare createdAt: Date;
}
export const initializeUserModel=(sequelize: Sequelize): void=>{
UserModel.init(
    {
        id: {
            type: DataTypes.STRING(32),
            primaryKey: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        passwordHash:{
            type: DataTypes.TEXT,
            allowNull: false,
            field: "password_hash",
        },
        createdAt:{
            type: DataTypes.DATE,
            allowNull: false,
            field: "created_at",
        }
    },
    {
        sequelize,
        tableName: "users",
        timestamps: false,
    }
);
};