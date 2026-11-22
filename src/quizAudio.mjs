// Pure helper for voice-based accessibility: read choices but never reveal the answer.
export function quizQuestionSpeech(question,index=0){
 const number=Number.isInteger(index)&&index>=0?index+1:1;
 const prompt=String(question?.question||'').trim();
 const choices=Array.isArray(question?.options)?question.options:[];
 const answers=choices.map((text,i)=>'Pilihan '+String.fromCharCode(65+i)+'. '+String(text)).join('. ');
 return 'Soal nomor '+number+'. '+prompt+'. '+answers+'. Pilih jawaban yang paling tepat.';
}
