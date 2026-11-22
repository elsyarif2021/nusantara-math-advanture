// Role selection is exclusively for visitors before authentication.
// Each signed-in role uses its own dashboard/profile instead.
export function shouldShowRoleEntry({view,student,teacherAuthed,admin}){
 return view!=='teacher'&&view!=='admin'&&!student&&!teacherAuthed&&!admin;
}
