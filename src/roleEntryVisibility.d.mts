export type RoleSelectorView='home'|'materi'|'pencapaian'|'quiz'|'result'|'admin'|'teacher';
export function shouldShowRoleEntry(state:{view:RoleSelectorView;student:boolean;teacherAuthed:boolean;admin:boolean}):boolean;
