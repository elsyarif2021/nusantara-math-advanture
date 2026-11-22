import type {CSSProperties,KeyboardEvent} from 'react';
import {islandData} from './learning';

const positions=[
 {x:148,y:220,tagX:128,tagY:188},
 {x:346,y:330,tagX:341,tagY:346},
 {x:404,y:180,tagX:416,tagY:154},
 {x:588,y:235,tagX:587,tagY:202},
 {x:539,y:364,tagX:554,tagY:379},
 {x:735,y:279,tagX:751,tagY:240},
 {x:868,y:199,tagX:867,tagY:170}
];
const shapes=[
 'M 105 91 Q 118 98 129 112 L 142 131 Q 152 138 147 152 L 167 174 L 180 212 L 191 238 L 189 270 L 207 300 Q 199 324 184 316 L 163 289 L 147 265 L 124 250 L 115 225 L 97 217 L 88 184 L 94 160 L 85 144 L 90 110 Z',
 'M 224 323 Q 250 306 279 318 L 302 325 L 331 321 L 363 328 L 389 334 L 432 339 L 459 346 Q 448 356 413 355 L 382 350 L 351 351 L 323 343 L 283 343 L 258 340 L 233 335 Z',
 'M 321 119 Q 333 106 355 115 L 378 107 Q 404 105 413 126 L 445 120 L 458 137 L 466 161 L 460 181 L 467 205 L 444 244 L 412 255 L 380 240 L 360 220 L 333 218 L 324 202 L 319 174 L 305 145 Z',
 'M 574 149 L 587 138 L 602 148 L 603 175 L 591 193 L 603 209 L 609 228 L 629 241 L 648 224 L 665 228 L 655 245 L 631 263 L 621 287 L 606 304 L 594 289 L 599 267 L 578 256 L 562 256 L 557 271 L 543 275 L 548 255 L 562 240 L 577 231 L 584 215 L 572 194 L 560 183 L 564 161 Z',
 'M 469 353 L 489 351 L 505 356 L 499 365 L 479 365 Z M 522 359 L 545 358 L 548 369 L 527 371 Z M 561 363 L 589 361 L 590 372 L 564 376 Z M 603 362 L 624 363 L 634 374 L 605 376 Z M 647 361 L 658 354 L 662 374 L 648 377 Z',
 'M 706 239 L 721 227 L 728 242 L 721 254 L 715 269 L 705 261 Z M 745 264 L 755 252 L 767 258 L 771 280 L 758 296 L 745 286 Z M 691 295 L 701 285 L 708 300 L 700 316 Z',
 'M 787 152 L 804 134 L 827 133 L 848 153 L 867 143 L 886 145 L 910 162 L 942 176 L 950 196 L 937 212 L 944 237 L 934 255 L 908 259 L 883 247 L 860 258 L 838 244 L 808 251 L 801 235 L 785 227 L 779 200 L 790 185 Z'
];
export function IndonesiaMap({completed=[],onSelect}:{completed?:number[],onSelect:(i:number)=>void}){
 const navigate=(e:KeyboardEvent<SVGGElement>,i:number)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(i)}};
 return <svg viewBox="0 0 1000 480" className="islands-svg" role="img" aria-label="Peta grafis Indonesia dengan tujuh pilihan misi pulau">
 <defs>
  <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8ee4fa"/><stop offset=".53" stopColor="#38b7e6"/><stop offset="1" stopColor="#008ac3"/></linearGradient>
  <linearGradient id="land" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a9ee71"/><stop offset=".55" stopColor="#58ca62"/><stop offset="1" stopColor="#239b56"/></linearGradient>
  <linearGradient id="seaWave" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ffffff" stopOpacity=".4"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/></linearGradient>
  <filter id="landShadow"><feDropShadow dx="1" dy="8" stdDeviation="4" floodColor="#02678a" floodOpacity=".45"/></filter>
  <filter id="pinShadow"><feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#064f79" floodOpacity=".4"/></filter>
 </defs>
 <rect width="1000" height="480" rx="22" fill="url(#sea)"/>
 <path d="M0 80 Q200 50 380 95 T790 70 T1000 84 M0 420 Q230 396 470 434 T1000 414" stroke="#c5f8ff" strokeOpacity=".27" strokeWidth="26" fill="none"/>
 {Array.from({length:15},(_,i)=><path key={i} d={`M${(i*97+12)%990} ${(i*73+55)%470} q12 -7 25 0 q12 7 25 0`} stroke="#d9f8fb" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".45"/>)}
 <g filter="url(#landShadow)">{shapes.map((d,i)=><g key={i}><path d={d} fill="#d9d28b" stroke="#f8efbf" strokeWidth="9" strokeLinejoin="round"/><path d={d} fill="url(#land)" stroke="#278d4f" strokeWidth="3" strokeLinejoin="round"/>{i<4&&<path d={d} fill="none" stroke="#dbff85" strokeOpacity=".52" strokeWidth="7" strokeDasharray="15 50"/>}</g>)}</g>
 <g opacity=".92" fontSize="27">
  <text x="124" y="155">🌴</text><text x="160" y="258">🌳</text><text x="285" y="324">🌺</text><text x="343" y="179">🌳</text><text x="436" y="196">🦧</text><text x="575" y="185">🌴</text><text x="619" y="248">🌳</text><text x="821" y="198">🌿</text><text x="895" y="220">🦜</text>
 </g>
 <path d="M149 220 Q185 304 346 330 Q437 397 539 364 Q466 251 404 180 Q509 148 588 235 Q642 305 735 279 Q798 205 868 199" stroke="#fff" strokeWidth="5" fill="none" strokeDasharray="8 12" strokeLinecap="round" opacity=".85"/>
 <g className="map-ship" transform="translate(260 405)"><ellipse cx="0" cy="16" rx="51" ry="9" fill="#e9fbff" opacity=".8"/><path d="M-47 1L50 1L31 22L-27 22Z" fill="#ac592a" stroke="#65391e" strokeWidth="3"/><path d="M0 -76V5" stroke="#6d4122" strokeWidth="5"/><path d="M-5 -70L-38 -4L-4 -3Z" fill="#fff0c8" stroke="#fbc965" strokeWidth="3"/><path d="M8 -66L43 -5L8 -5Z" fill="#f95c36" stroke="#d34628" strokeWidth="2"/><path d="M0 -76v-13" stroke="#6d4122" strokeWidth="3"/><path d="M1 -88h26v15H1z" fill="#f44336"/><path d="M1 -80h26v7H1z" fill="#fff"/></g>
 <g className="compass-rose" transform="translate(947 63)"><circle r="35" fill="#fffbea" stroke="#0b70a0" strokeWidth="4"/><path d="M0 -28L9 -8L0 28L-9 8Z" fill="#ffb541"/><path d="M-28 0L-8 -9L28 0L8 9Z" fill="#1d85ab"/><circle r="6" fill="#173e69"/><text x="0" y="-39" fontSize="14" textAnchor="middle" fontWeight="900" fill="#173e69">U</text><text x="0" y="50" fontSize="14" textAnchor="middle" fontWeight="900" fill="#173e69">S</text></g>
 {positions.map((m,i)=>{
  const data=islandData[i];const done=completed.includes(i+1);return <g key={data.id} className="geo-pin" tabIndex={0} role="button" aria-label={'Mulai misi '+data.name} onClick={()=>onSelect(i)} onKeyDown={e=>navigate(e,i)} transform={`translate(${m.x} ${m.y})`}>
   <circle r="22" fill="#fff9dc" opacity=".87" className="pin-halo"/>
   <path d="M0 19C-19 -1 -18 -18 0 -20C18 -18 19 -1 0 19Z" fill={done?'#f8c640':'#f4544c'} stroke="white" strokeWidth="4" filter="url(#pinShadow)"/>
   <circle cy="-7" r="7" fill="#fff"/>
   <g transform={`translate(${m.tagX-m.x} ${m.tagY-m.y})`}><rect x="-60" y="-16" width="120" height="31" rx="14" fill="#fffbea" stroke="#e0c684" strokeWidth="2"/><text y="5" fontSize={i===4?12:14} fill="#153a66" textAnchor="middle" fontWeight="900">{i===4?'Bali & Nusa Tenggara':data.name}</text></g>
   {done&&<text y="-27" textAnchor="middle" fontSize="24">⭐</text>}
   <title>{data.name}: {data.culture}</title>
  </g>
 })}
 <g transform="translate(26 24)"><rect width="240" height="40" rx="14" fill="#88502d" stroke="#d9a45b" strokeWidth="5"/><text x="120" y="26" textAnchor="middle" fontSize="17" fontWeight="900" fill="#fff6d8">🧭 Peta Petualangan</text></g>
 <g transform="translate(730 395)"><rect width="250" height="68" rx="13" fill="#fff9e5" stroke="#e5ca8a" strokeWidth="3"/><text x="15" y="22" fontWeight="900" fontSize="14" fill="#214365">Legenda Peta</text><text x="15" y="42" fontSize="12" fill="#385b70">📍 Pilih pulau untuk bermain</text><text x="15" y="60" fontSize="12" fill="#385b70">⭐ Pulau yang sudah selesai</text></g>
 </svg>
}
type CulturalArtProps={id:string;className?:string;label?:boolean};
export function CultureArt({id,className='',label=true}:CulturalArtProps){
 const item=islandData.find(i=>i.id===id)||islandData[0];
 const common=<><defs><linearGradient id={'sky-'+id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#85dbf6"/><stop offset="1" stopColor="#d5fbe9"/></linearGradient></defs><rect width="440" height="245" rx="18" fill={`url(#sky-${id})`}/><circle cx="378" cy="45" r="30" fill="#ffe99c"/><path d="M0 144 Q84 94 170 144 T340 140 T440 130 V245H0Z" fill="#78d4a3"/><path d="M0 175 Q95 135 206 176 T440 167 V245H0Z" fill="#68bd7f"/><path d="M0 203Q105 180 202 206T440 193V245H0Z" fill="#e0c89a"/><path d="M18 58q24-29 56 0t57 0" stroke="white" fill="none" strokeWidth="18" strokeLinecap="round" opacity=".8"/></>;
 const house=<g transform="translate(88 68)"><rect x="35" y="84" width="214" height="92" fill="#bd7647" stroke="#793d2f" strokeWidth="5"/>{Array.from({length:5},(_,i)=><path key={i} d={`M${i*55} 86 Q${i*55+12} 52 ${i*55+27} 22 Q${i*55+42} 55 ${i*55+55} 86`} fill="#543c57" stroke="#492f37" strokeWidth="6"/>)}{[0,1,2,3].map(i=><rect key={i} x={55+i*46} y="111" width="27" height="39" rx="2" fill="#ffc77f" stroke="#663d33" strokeWidth="4"/>)}<path d="M26 172H260" stroke="#87583c" strokeWidth="9"/></g>;
 let draw;
 if(id==='sumatra')draw=<>{house}<g transform="translate(355 177)"><ellipse rx="22" ry="12" fill="#ffebc8" stroke="#e4873a" strokeWidth="7"/><ellipse rx="10" ry="5" fill="#ff9d5e"/></g></>;
 else if(id==='jawa')draw=<g transform="translate(105 39)" fill="#6b6a83" stroke="#4f516b" strokeWidth="3"><rect x="10" y="159" width="232" height="22" rx="4"/><rect x="34" y="138" width="184" height="23"/><rect x="57" y="110" width="140" height="29"/><rect x="80" y="88" width="95" height="23"/><path d="M100 89 L111 70 H146 L157 89Z"/>{Array.from({length:7},(_,i)=><g key={i} transform={`translate(${24+i*34} 135)`}><path d="M0 0h23l-11-19Z" fill="#9294aa"/></g>)}</g>;
 else if(id==='kalimantan')draw=<><g transform="translate(90 70)"><path d="M10 95L260 95L240 70L30 70Z" fill="#7c3d25"/><rect x="40" y="94" width="185" height="72" fill="#e0a35f" stroke="#855025" strokeWidth="4"/>{[0,1,2,3,4].map(i=><rect key={i} x={52+i*33} y="115" width="20" height="29" fill="#8a5f37"/>)}<path d="M30 165V195M225 165V195" stroke="#6c4635" strokeWidth="8"/></g><text x="338" y="207" fontSize="60">🦧</text></>;
 else if(id==='sulawesi')draw=<><g transform="translate(76 72)"><rect x="64" y="75" width="224" height="91" fill="#bd7647" stroke="#693b2e" strokeWidth="5"/><path d="M0 95Q60 8 175 40Q285 7 346 95Q290 89 254 72Q175 51 104 76Q66 89 0 95Z" fill="#704236" stroke="#b56442" strokeWidth="7"/><rect x="150" y="111" width="43" height="54" fill="#6a4a31"/><path d="M58 166H310" stroke="#634032" strokeWidth="8"/></g><text x="345" y="209" fontSize="38">🐃</text></>;
 else if(id==='bali')draw=<><g transform="translate(65 50)" fill="#555467" stroke="#403a52" strokeWidth="4"><path d="M105 167L128 70L151 167H105ZM205 167L227 70L251 167H205Z"/><path d="M110 103L126 81L142 103M211 103L226 81L242 103" stroke="#ac7b4c" strokeWidth="6"/><rect x="56" y="167" width="253" height="21" rx="3"/><path d="M64 153h55L96 113ZM246 153h55L268 113Z" fill="#8c7869"/></g><g transform="translate(334 125)"><path d="M0 71Q-24 27 0-19Q24 27 0 71Z" fill="#f7cb78" stroke="#bc8a49" strokeWidth="4"/>{Array.from({length:7},(_,i)=><line key={i} x1="0" y1="0" x2={(i-3)*7} y2="43" stroke="#8d602f" strokeWidth="2"/>)}<rect x="-5" y="58" width="10" height="31" fill="#854c31"/></g></>;
 else if(id==='maluku')draw=<><text x="65" y="195" fontSize="100">🌰</text><g transform="translate(232 82)"><path d="M35 26L123 8L145 132L54 158Z" fill="#af663d" stroke="#673b2f" strokeWidth="7"/><path d="M35 26L123 8" stroke="#fbd284" strokeWidth="14"/><path d="M54 158L145 132" stroke="#fbd284" strokeWidth="14"/>{[0,1,2,3].map(i=><path key={i} d={`M${57+i*17} 28L${69+i*17} 151`} stroke="#e4ae70" strokeWidth="4"/>)}<path d="M35 25L123 8" stroke="#68442c" strokeWidth="5"/></g></>;
 else draw=<><g transform="translate(112 70)"><path d="M42 50Q20 55 28 128Q41 175 109 173Q177 175 192 125L182 58Z" fill="#cb9161" stroke="#795338" strokeWidth="7"/><path d="M44 64Q110 18 180 65" fill="none" stroke="#815a40" strokeWidth="12"/>{Array.from({length:6},(_,i)=><path key={i} d={`M${48+i*22} 70L${52+i*22} 163`} stroke="#68492f" strokeWidth="3"/>)}{Array.from({length:4},(_,i)=><path key={i} d={`M40 ${88+i*17}H184`} stroke="#edc683" strokeWidth="5"/>)}</g><text x="336" y="175" fontSize="62">🦜</text></>;
 return <div className={'culture-illustration '+className}><svg viewBox="0 0 440 245" role="img" aria-label={'Ilustrasi budaya '+item.culture} preserveAspectRatio="xMidYMid slice">{common}{draw}<path d="M0 224Q145 210 250 225T440 219" fill="none" stroke="#ffffff88" strokeWidth="5"/></svg>{label&&<div className="culture-overlay"><strong>{item.name}</strong><span>{item.culture}</span></div>}</div>;
}
export function ExplorerHero(){return <svg className="explorer-hero" viewBox="0 0 980 260" role="img" aria-label="Anak-anak penjelajah di kapal tradisional Nusantara di lautan biru">
 <defs><linearGradient id="heroSea" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7ed5ef"/><stop offset="1" stopColor="#0a8bbb"/></linearGradient></defs>
 <rect width="980" height="260" rx="20" fill="#b6edfd"/><circle cx="831" cy="56" r="42" fill="#ffefab"/>
 <path d="M0 151Q152 65 311 145T690 114T980 130V260H0Z" fill="#73c79f"/><path d="M0 173Q242 146 459 176T980 164V260H0Z" fill="url(#heroSea)"/>
 <g opacity=".95"><text x="75" y="190" fontSize="112">🧒🏽</text><text x="207" y="191" fontSize="112">👧🏽</text><text x="326" y="197" fontSize="70">🗺️</text></g>
 <g className="hero-sailing" transform="translate(620 185)"><ellipse cx="45" cy="18" rx="165" ry="15" fill="#ecffffa8"/><path d="M-106 2L214 2L171 54L-63 54Z" fill="#9b4b28" stroke="#69361c" strokeWidth="6"/><path d="M17 -154V8" stroke="#87552f" strokeWidth="9"/><path d="M8 -141L-87 -4L7 -4Z" fill="#fff0c7" stroke="#e4a24d" strokeWidth="6"/><path d="M28 -138L173 -4L28 -4Z" fill="#f36d48" stroke="#d44932" strokeWidth="6"/><path d="M17 -156V-179" stroke="#7d491d" strokeWidth="5"/><path d="M17 -179H77V-145H17Z" fill="#f64d3b"/><path d="M17 -161H77V-145H17Z" fill="#fff"/><path d="M-72 0L160 0" stroke="#f8c65d" strokeWidth="8"/>{Array.from({length:7},(_,i)=><rect key={i} x={-40+i*28} y="12" width="18" height="21" rx="2" fill="#fac46f"/>)}</g>
 <text x="455" y="43" fill="#fff8e8" opacity=".6" fontSize="31">☁️</text><text x="894" y="107" fontSize="51">🌴</text><text x="24" y="106" fontSize="46">🌺</text>
 <path d="M0 218Q190 205 380 225T780 213T980 224" stroke="#ffffff80" strokeWidth="5" fill="none"/>
 </svg>}
