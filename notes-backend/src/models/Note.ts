import { DataTypes, Model,type Sequelize} from "sequelize";
import { sequelize } from "../db/database.js";
export class NoteModel extends Model{
    declare id: number;
    declare title: string;
    declare content: string;
    declare category: "Work"|"Study"|"Personal";
    declare priority: "Low"|"Medum"|"High";
    declare tenantId: string;
}

export const initializeNoteModel=(sequelize: Sequelize):void=>{
    NoteModel.init(
        {
            id:{
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title:{
                type: DataTypes.STRING(255),
                allowNull: false,                         
            },
            content:{
                type: DataTypes.TEXT,
                allowNull: false,
            },
            category:{
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            priority:{
                type: DataTypes.STRING(32),
                allowNull: false,
            },
            tenantId:{
                type: DataTypes.STRING(32),
                allowNull: false,
                field:"tenant_id",
                references:{
                    model: "tenants",
                    key: "id",
                },
            },
        },
        {
            sequelize,
            tableName: "notes",
            timestamps: false,
        }
    );
};