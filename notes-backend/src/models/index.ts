import { sequelize } from "../db/database.js";
import { TenantModel,initializeTenantModel } from "./Tenant.js";
import { NoteModel,initializeNoteModel } from "./Note.js";
import { UserModel, initializeUserModel } from "./User.js";

initializeTenantModel(sequelize);
initializeNoteModel(sequelize);
initializeUserModel(sequelize);

TenantModel.hasMany(NoteModel,{
    foreignKey: "tenantId", as: "notes",
});

NoteModel.belongsTo(TenantModel,{
    foreignKey: "tenantId",as:"tenant"
});

export { sequelize,TenantModel,NoteModel,UserModel};