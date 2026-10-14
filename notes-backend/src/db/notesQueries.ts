import { Op } from "sequelize";
import { NoteModel,TenantModel} from "../models/index.js";
import type { Note, Tenant,PaginatedNotes} from "../definitions/index.js";
import { noteSchema } from "../validators/valid.js";
import { createId } from "@paralleldrive/cuid2";
type NoteInput = Omit<Note,"id" | "tenantId">;
// GET tenants
export const getTenants=async():Promise<Tenant[]>=>{
    const tenants=await TenantModel.findAll({
        attributes: ["id","name"],
        order:[["name","ASC"]],
    });
    return tenants.map((tenant)=>tenant.get({plain: true}) as Tenant);
};
// POST tenants
export const createTenant=async(name: string): Promise<Tenant>=>{
    const tenant = await TenantModel.create({
        id: createId(),
        name,
    });
    return { id: tenant.id, name: tenant.name};
};
// Tenant exist
export const tenantExists=async(tenantId: string): Promise<boolean>=>{
    const tenant=await TenantModel.findByPk(tenantId,{
        attributes:["id"],
    });
    return tenant !== null;
};
export const getNotesByTenant = async( tenantId: string,cursor: number| undefined| null,pageSize:number): Promise<PaginatedNotes>=>{
    const where ={
        tenantId,...(cursor!==null && cursor !== undefined ?{id:{[Op.gt]:cursor}}:{}),
    };
    const rows = await NoteModel.findAll({
        where,
        order: [["id","ASC"]],limit: pageSize+1,
    });
    const hasMore=rows.length>pageSize;
    const pageRows = rows.slice(0,pageSize);
    const data=pageRows.map((row)=>row.get({plain:true}) as Note);
    const nextCursor=hasMore && data.length>0?data[data.length-1]?.id??null : null;
    return {data,nextCursor,hasMore};
};
export const createNote = async(note: NoteInput,tenantId:string): Promise<Note>=>{
    const createNote = await NoteModel.create({
        ...note,tenantId,
    });
        
    return createNote.get({plain:true}) as Note;
};
export const updateNote = async(
    id: number,
    note: NoteInput,
    tenantId: string): Promise<Note | null> =>{
        const existingNote=await NoteModel.findOne({
            where:{id, tenantId},
    });
    if (!existingNote){
        return null;
    }
    await existingNote.update(note);
        return existingNote.get({ plain: true}) as Note;
};

export const deleteNote = async(id: number,tenantId: string): Promise<Note | null>=>{
    const existingNote=await NoteModel.findOne({
        where:{id,tenantId},
    });
    if (!existingNote){
        return null;
    }
    const deleteNote = existingNote.get({plain: true}) as Note;
    await existingNote.destroy();
    return deleteNote;
};

export const patchNote = async(id: number,priority:Note["priority"],tenantId :string):Promise<Note | null>=>{
    const existingNote=await NoteModel.findOne({
        where: { id, tenantId },
    });
    if(!existingNote){
        return null;
    }
    await existingNote.update({priority});
    return existingNote.get({plain: true}) as Note;
};