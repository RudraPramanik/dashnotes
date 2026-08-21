import type { components } from "./schema";

type Schemas = components["schemas"];

export type Note = Schemas["NoteRead"];
export type NoteCreate = Schemas["NoteCreate"];
export type NoteUpdate = Schemas["NoteUpdate"];
export type Notebook = Schemas["NotebookRead"];
export type NotebookCreate = Schemas["NotebookCreate"];
export type FileRecord = Schemas["FileResponse"];
export type FileList = Schemas["FileListResponse"];
export type Workspace = Schemas["WorkspaceRead"];
export type WorkspaceMember = Schemas["MemberRead"];
export type Thread = Schemas["ThreadResponse"];
export type ThreadMessage = Schemas["MessageResponse"];
export type ChatCitation = Schemas["Citation"];
export type ChatRequest = Schemas["ChatRequest"];
export type AgentRequest = Schemas["AgentRequest"];
export type TokenPairResponse = Schemas["TokenResponse"];
export type IndexingStatus = "pending" | "processing" | "indexed" | "failed";
