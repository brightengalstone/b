export const OPERATING_HOURS={openHour:8,closeHour:20,timezone:'Africa/Johannesburg'};
export function getOrderingStatus(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-ZA',{timeZone:OPERATING_HOURS.timezone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const hour=Number(parts.find(p=>p.type==='hour').value), minute=Number(parts.find(p=>p.type==='minute').value);
 const current=hour*60+minute, open=480, close=1200;
 if(current<open)return {open:false,warning:false,message:'Ordering opens at 08:00.',label:'Closed'};
 if(current>=close)return {open:false,warning:false,message:'Orders are closed for today. Ordering opens at 08:00.',label:'Closed'};
 if(current>=1140){const remaining=close-current;return {open:true,warning:true,message:'Orders close in '+remaining+' minutes. Please place your order before 20:00.',label:'Closing soon'};}
 return {open:true,warning:false,message:'Open for orders',label:'Open'};
}
