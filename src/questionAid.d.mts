export type QuestionAidKind=string;
export type QuestionAid={kind:QuestionAidKind;title:string;icon:string;idea:string;formula:string;calculator:boolean;steps:[string,string,string,string];numbers:string[];grade:string};
export function getQuestionAid(question:string,topic?:string,grade?:string):QuestionAid;
