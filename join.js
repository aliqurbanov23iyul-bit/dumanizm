const $ = s => document.querySelector(s);
let currentStep = 0;
const formData = {};
function toast(msg){const el=$('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200);}
function updateProgress(step){document.querySelectorAll('.step-dot').forEach((d,i)=>d.classList.toggle('done',i<=step));const l=$('#stepLabel');if(l)l.textContent=`${step+1} / 4`;}
function showStep(n){document.querySelectorAll('.step-panel').forEach((p,i)=>p.classList.toggle('active',i===n));updateProgress(n);const inp=document.querySelector(`#step${n} .field-input`);if(inp)setTimeout(()=>inp.focus(),350);}
function validate(step){
 if(step===0){const v=$('#inp-name')?.value.trim();if(!v||v.length<2){toast('Adini duzgun daxil et');return false;}formData.name=v;}
 if(step===1){const v=parseInt($('#inp-age')?.value);if(!v||v<14||v>99){toast('Yaşi duzgun daxil et (14-99)');return false;}formData.age=v;}
 if(step===2){const v=$('#inp-song')?.value.trim();if(!v){toast('Sevdiyin mahnini yaz');return false;}formData.favorite_song=v;}
 if(step===3){const v=$('#inp-phone')?.value.trim();if(!v||v.length<6){toast('Nömrəni duzgun daxil et');return false;}formData.phone=v;}
 return true;
}
[0,1,2].forEach(i=>$(`#next${i}`)?.addEventListener('click',()=>{if(validate(i)){currentStep=i+1;showStep(currentStep);}}));
[1,2,3].forEach(i=>$(`#back${i}`)?.addEventListener('click',()=>{currentStep=i-1;showStep(currentStep);}));
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&currentStep<3)$(`#next${currentStep}`)?.click();});
$('#submitBtn')?.addEventListener('click',async()=>{
 if(!validate(3))return;
 const btn=$('#submitBtn');btn.disabled=true;btn.textContent='Bilet yaradılır... 🎀';
 try{
  const r=await fetch('/api/applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(formData)});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data.error||'Xəta başla verdi');
  const ticket={id:data.id,name:data.name||formData.name,favorite_song:data.favorite_song||formData.favorite_song,crew_id:data.crew_id,status:data.status||'pending'};
  localStorage.setItem('diva_user_ticket',JSON.stringify(ticket));
  $('#openTicketBtn').href=data.ticket_url||`ticket.html?id=${data.id}`;
  $('#stepFormWrap').style.display='none';$('#joinSuccess').classList.add('show');
 }catch(err){toast(err.message||'Bilet yaradilmadi. Yeniden yoxla.');btn.disabled=false;btn.textContent='Biletimi yarat 🎀';}
});
showStep(0);