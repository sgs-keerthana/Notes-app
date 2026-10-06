import { pool } from "./database.js";
import type { Note } from "../definitions/index.js";
import { noteSchema } from "../validators/valid.js";
type NoteInput = Omit<Note,"id" | "tenantId">;

export const getNotesByTenant = async( tenantId: string): Promise<Note[]>=>{
    const result = await pool.query(
       `SELECT id,title,content,category,priority,tenant_id AS "tenantId" FROM notes
        WHERE tenant_id=$1
        ORDER BY id `,[tenantId]);
    return result.rows;
};
export const createNote = async(note: NoteInput,tenantId:string): Promise<Note>=>{
    const result = await pool.query(
        `
        INSERT INTO notes(title,content,category,priority,tenant_id) VALUES ($1,$2,$3,$4,$5)
        RETURNING id,title,content,category,priority,tenant_id AS "tenantId"
        `,
        [
            note.title,
            note.content,
            note.category,
            note.priority,
            tenantId,
        ]
    );
    return result.rows[0];
};
export const updateNote = async(
    id: number,
    note: NoteInput,
    tenantId: string): Promise<Note | null> =>{
        const result=await pool.query(
            `
            UPDATE notes
            SET
            title = $1,
            content = $2,
            category = $3,
            priority = $4
            WHERE id =$5 AND tenant_id=$6
            RETURNING id,title,content,category,priority,tenant_id AS "tenantId"
            `,
            [
                note.title,
                note.content,
                note.category,
                note.priority,
                id,
                tenantId
            ]
        );
        return result.rows[0]?? null;
};

export const deleteNote = async(id: number,tenantId: string): Promise<Note | null>=>{
    const result = await pool.query(
        `DELETE FROM notes
        WHERE id = $1 AND tenant_id=$2
        RETURNING id,title,content,category,priority,tenant_id AS "tenantId"
        `,
        [id, tenantId]
    );
    return result.rows[0]?? null;
};

export const patchNote = async(id: number,priority:NoteInput["priority"],tenantId :string):Promise<Note | null>=>{
    const result=await pool.query(
        `
        UPDATE notes
        SET priority =$1
        WHERE id=$2
        AND tenant_id=$3
        RETURNING id,title,content,category,priority,tenant_id AS "tenantId"
        `,
        [
            priority,id,tenantId
        ]
    );
    return result.rows[0]??null;
};