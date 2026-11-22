const ID='[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const OWNER='(?:superadmin|t-'+ID+')';
const FORMATS={
 video:{mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime'},
 audio:{mp3:'audio/mpeg'},
};
export const QUESTION_MEDIA_LIMITS={video:50*1024*1024,audio:15*1024*1024};
const PATH=new RegExp('^question-media/(video|audio)/('+OWNER+')/('+ID+')\\.(mp4|webm|mov|mp3)$');
const ROUTE=new RegExp('^question-media/file/(video|audio)/('+OWNER+')/('+ID+')\\.(mp4|webm|mov|mp3)$');
const URL=new RegExp('^/api/question-media/file/(video|audio)/('+OWNER+')/('+ID+')\\.(mp4|webm|mov|mp3)$');

function info(match){
 if(!match)return null;
 const [,kind,owner,id,ext]=match;
 const contentType=FORMATS[kind]?.[ext];
 if(!contentType)return null;
 return {kind,owner,id,ext,contentType,maxBytes:QUESTION_MEDIA_LIMITS[kind],pathname:'question-media/'+kind+'/'+owner+'/'+id+'.'+ext,url:'/api/question-media/file/'+kind+'/'+owner+'/'+id+'.'+ext};
}
export function mediaUploadPath(path){return typeof path==='string'?info(path.match(PATH)):null}
export function mediaRoute(path){return typeof path==='string'?info(path.match(ROUTE)):null}
export function isInternalQuestionMediaUrl(field,value){
 if(!['videoUrl','audioUrl'].includes(field)||typeof value!=='string')return false;
 const obj=info(value.match(URL));
 return Boolean(obj&&(field==='videoUrl'?obj.kind==='video':obj.kind==='audio'));
}
