'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>(n/100).toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});
const role=()=>$('role').value, project=()=>$('project').value, sender=()=>$('sender').value;
const actor=()=>role()==='OWNER'?$('owner').value:role()==='TECH'?sender():'DEMO-'+role();
const labels={jobs:'งานของฉัน',work:'ลงวันทำงาน',ot:'ลง OT',expense:'ส่งค่าใช้จ่าย',status:'ตรวจสถานะของฉัน',review:'ตรวจรายการ / กำลังคน',evidence:'ค่าใช้จ่ายรายเดือน / รูปบิล',payroll:'ตรวจรอบค่าจ้าง'};
let page='jobs', records=[], draft=null, run='OPEN', frozen=[], audit=[], sequence=0, month='2026-09', pickerBusy=false;
const objectUrls=new Set();
const allowed=()=>role()==='TECH'?['jobs','work','ot','expense','status']:role()==='OWNER'?['jobs','review','evidence','payroll']:role()==='ADMIN'?['jobs','review','payroll']:['jobs','review'];
function urlFor(bytes,type){const url=URL.createObjectURL(new Blob([bytes],{type}));objectUrls.add(url);return url;}
function releaseAttachment(f){URL.revokeObjectURL(f.url);objectUrls.delete(f.url);}
function discardDraft(){if(draft?.attachments)draft.attachments.forEach(releaseAttachment);draft=null;}
function say(text){$('message').textContent=text;}
function html(text){$('screen').insertAdjacentHTML('beforeend',text);}
function button(text,fn,secondary=false){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=secondary?'secondary':'';b.onclick=fn;return b;}
function actions(...buttons){const d=document.createElement('div');buttons.forEach(b=>d.append(b));$('screen').append(d);}
function navigate(next){if(draft&&!confirm('มีข้อมูลยังไม่ได้ส่ง ต้องการละทิ้งหรือไม่?'))return;discardDraft();page=next;render();}
function visible(){return records.filter(r=>r.project===project()&&(role()!=='TECH'||r.sender===sender())).filter(r=>r.kind!=='expense'||M0.canSeeExpense(role(),sender(),r));}
function render(){
  if(!allowed().includes(page))page='jobs';
  $('ownerControl').hidden=role()!=='OWNER';$('senderControl').hidden=role()!=='TECH';
  $('nav').replaceChildren();allowed().forEach(k=>{const b=button(labels[k],()=>navigate(k));if(k===page)b.classList.add('active');$('nav').append(b);});
  $('screen').replaceChildren();say('');
  if(role()==='PM'&&project()==='A'){html('<h2>ไม่มีสิทธิ์โครงการนี้</h2><p>DEMO-PM รับผิดชอบเฉพาะโครงการ B</p>');return;}
  ({jobs,work:()=>entry('work'),ot:()=>entry('ot'),expense:()=>entry('expense'),status,review,evidence,payroll}[page])();
}
function jobs(){
  html('<h2>งานของฉัน</h2><div class="card"><h3>DEMO-PRJ-'+project()+'</h3><p>'+(project()==='A'?'ดูแลระบบ · มอบหมายระดับโครงการ':'ติดตั้งระบบ · DEMO-SITE-B')+'</p><span class="status">กำลังดำเนินการ</span></div>');
  if(project()==='B')html('<details><summary>ดูงานย่อย</summary><p>DEMO-JOB-B1 · ติดตั้ง<br>DEMO-JOB-B2 · ทดสอบ</p></details>');
  if(role()==='TECH')actions(button('ลงวันทำงาน',()=>navigate('work')),button('ลง OT',()=>navigate('ot')),button('ส่งค่าใช้จ่าย',()=>navigate('expense')));
  else html('<p>ดูจำนวนคน วันทำงาน และชั่วโมง OT ได้จากหน้าตรวจรายการ</p>');
}
function jobField(){return project()==='B'?'<details><summary>ระบุงานย่อย (เพิ่มเติม)</summary><label>งานย่อย<select id="job"><option value="">บันทึกระดับโครงการ</option><option value="B1">DEMO-JOB-B1 · ติดตั้ง</option><option value="B2">DEMO-JOB-B2 · ทดสอบ</option></select></label></details>':'';}
function showAttachments(files,target,editable=false){
  target.replaceChildren();
  files.forEach((f,index)=>{
    const box=document.createElement('div');box.className='attachment';
    const a=document.createElement('a');a.href=f.url;a.target='_blank';a.rel='noopener';
    if(f.type.startsWith('image/')){const img=document.createElement('img');img.src=f.url;img.alt='หลักฐาน '+(index+1);a.append(img);}else a.textContent='เปิด PDF หลักฐาน '+(index+1);
    const text=document.createElement('p');text.textContent='หลักฐาน '+(index+1)+' · '+f.ext.toUpperCase()+' · '+Math.ceil(f.bytes.length/1024)+' KB';
    box.append(a,text);
    if(editable)box.append(button('ลบหลักฐาน '+(index+1),()=>{draft.attachments.splice(index,1);releaseAttachment(f);showAttachments(draft.attachments,target,true);say('ลบแล้ว เลือกไฟล์ใหม่เพื่อเพิ่มหรือแทนที่ได้');},true));
    target.append(box);
  });
}
function entry(kind,saved=null){
  draft=saved||{kind,attachments:[]};
  html('<h2>'+labels[kind]+'</h2><p>DEMO-PRJ-'+project()+' · '+esc(sender())+'</p><form id="entryForm"><label>วันที่<input id="date" type="date" required value="'+(saved?.date||'2026-09-21')+'"></label>'+jobField()+
    (kind==='work'?'<label>ช่วงวัน<select id="part"><option value="FULL">เต็มวัน</option><option value="AM">เช้า (ครึ่งวัน)</option><option value="PM">บ่าย (ครึ่งวัน)</option></select></label><p class="muted">หากไปสองโครงการในวันเดียว ให้ลงเช้าโครงการหนึ่งและบ่ายอีกโครงการหนึ่ง รวมหนึ่งวัน</p>':
    kind==='ot'?'<label>จำนวนชั่วโมง OT<input id="hours" type="number" min="0.5" step="0.5" required value="8"></label><p class="notice">เลือกวันที่ย้อนหลังได้ เช่น 21 กันยายน 8 ชั่วโมง แม้ทำต่อถึงวันที่ 22 ก็ใช้วันที่ 21 ทั้งรายการ ไม่ต้องใส่เวลาเริ่ม/จบ</p><p class="muted">ต้นแบบรองรับชั่วโมงเต็ม/ครึ่งชั่วโมง กติกาเศษย่อยกว่านี้ยังไม่ได้กำหนด</p>':
    '<label>ประเภทรายจ่าย<select id="category">'+M0.categories.map(([code,label])=>'<option value="'+code+'">'+label+'</option>').join('')+'</select></label><label>จำนวนเงิน (บาท)<input id="amount" type="number" min="0.01" step="0.01" value="500" required></label><p class="muted">ค่าแรงและ OT มาจากข้อมูลเวลา ไม่ต้องส่งซ้ำเป็นค่าใช้จ่าย ส่วนค่าอาหารตามบิลแยกจากค่ากินรายวัน</p><label>เลือกรูปบิล / ใบเสร็จ / สลิป / PDF<input id="files" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple></label><p class="muted">1–5 ไฟล์ ไม่เกิน 10 MB ต่อไฟล์ · ใช้ภาพทดสอบ · เลือกเพิ่มทีละชุดได้</p><div id="previews" class="attachments"></div>')+
    '<label>'+(kind==='ot'?'เหตุผล':'รายละเอียด')+'<textarea id="note" '+(kind==='work'?'':'required')+'></textarea></label><button id="summary" type="submit">ตรวจสรุป</button></form>');
  if(saved?.job&&$('job')){$('job').value=saved.job;$('job').closest('details').open=true;}
  if($('part'))$('part').value=saved?.part||'FULL';if($('hours'))$('hours').value=saved?.hours||8;
  if($('amount'))$('amount').value=saved?.amount?saved.amount/100:500;if($('category'))$('category').value=saved?.category||'FUEL';
  $('note').value=saved?.note??(kind==='expense'?'เดินทางไปหน้างาน':kind==='ot'?'ทดสอบระบบหลังเวลางาน':'');
  if(kind==='expense'){
    showAttachments(draft.attachments,$('previews'),true);
    $('files').onchange=async e=>{
      const selected=[...e.target.files], current=draft, additions=[];e.target.value='';
      if(current.attachments.length+selected.length>5){say('แนบได้สูงสุด 5 ไฟล์ กรุณาลบบางไฟล์ก่อน');return;}
      pickerBusy=true;$('summary').disabled=true;say('กำลังอ่านไฟล์ในเครื่อง…');
      try{
        for(const file of selected){if(file.size===0||file.size>10*1024*1024)throw Error('แต่ละไฟล์ต้องมีข้อมูลและไม่เกิน 10 MB');const bytes=new Uint8Array(await file.arrayBuffer());const [type,ext]=M0.mime(bytes);additions.push({bytes,type,ext,url:urlFor(bytes,type)});}
        if(draft!==current){additions.forEach(releaseAttachment);return;}
        current.attachments.push(...additions);showAttachments(current.attachments,$('previews'),true);say('อ่านไฟล์แล้ว '+current.attachments.length+' ไฟล์ · ยังไม่ได้ส่งขึ้นเซิร์ฟเวอร์');
      }catch(error){additions.forEach(releaseAttachment);if(draft===current)say(error.message);}
      finally{pickerBusy=false;if($('summary'))$('summary').disabled=false;}
    };
  }
  $('entryForm').onsubmit=e=>{
    e.preventDefault();if(pickerBusy)return;
    if(kind==='expense'&&!draft.attachments.length){say('กรุณาเลือกหลักฐานอย่างน้อย 1 ไฟล์');return;}
    const row={kind,project:project(),sender:sender(),date:$('date').value,job:$('job')?.value||null,note:$('note').value,part:$('part')?.value,hours:Number($('hours')?.value||0),amount:Math.round(Number($('amount')?.value||0)*100),category:$('category')?.value,attachments:draft.attachments};
    if(M0.overlap(records,row)){say('มีวันทำงานช่วงนี้แล้ว ถ้าไปสองโครงการให้แบ่งเช้าและบ่าย ไม่ลงเต็มวันซ้ำ');return;}
    draft=row;confirmEntry();
  };
  actions(button('ยกเลิก',()=>{discardDraft();page='jobs';render();},true));
}
function description(record){
  const r=['ADMIN','PM'].includes(role())?M0.timeProjection(record):record;
  if(r.kind==='expense'&&!M0.canSeeExpense(role(),sender(),record))return '';
  return '<p>โครงการ DEMO-PRJ-'+esc(r.project)+(r.job?'<br>งานย่อย DEMO-JOB-'+esc(r.job):'')+'<br>ผู้ส่ง '+esc(r.sender)+'<br>วันที่ '+esc(r.date)+'<br>'+
    (r.kind==='work'?'ช่วงวัน '+({FULL:'เต็มวัน',AM:'เช้า (0.5 วัน)',PM:'บ่าย (0.5 วัน)'}[r.part]):r.kind==='ot'?'OT '+r.hours+' ชั่วโมง':'ประเภท '+esc(M0.categories.find(c=>c[0]===r.category)?.[1])+'<br>ยอด '+money(r.amount)+' บาท<br>หลักฐาน '+r.attachments.length+' ไฟล์')+(r.note?'<br>'+esc(r.note):'')+'</p>';
}
function confirmEntry(){
  $('screen').replaceChildren();html('<h2>ตรวจสรุปก่อนส่ง</h2>'+description(draft));
  if(draft.kind==='expense'){const div=document.createElement('div');div.className='attachments';$('screen').append(div);showAttachments(draft.attachments,div);}
  actions(button('ยืนยันส่งตรวจ',()=>{
    if(!draft)return;if(M0.overlap(records,draft)){say('ช่วงวันทำงานซ้ำ กรุณากลับแก้ไข');return;}
    const id='DEMO-'+String(++sequence).padStart(3,'0');const late=draft.kind!=='expense'&&run!=='OPEN';
    records.push({...draft,id,status:draft.kind==='expense'?'PENDING_REVIEW':'SUBMITTED',late});draft=null;page='status';render();say(id+' บันทึกไว้ในต้นแบบแล้ว'+(late?' · ข้อมูลหลังปิดรอบ รอ Owner พิจารณา ไม่เปลี่ยนยอดเดิม':''));
  }),button('แก้ไข',()=>{const saved=draft;$('screen').replaceChildren();entry(saved.kind,saved);},true),button('ยกเลิก',()=>{discardDraft();page='jobs';render();},true));
}
function recordCard(r){const box=document.createElement('div');box.className='card';box.innerHTML='<strong>'+r.id+' · '+({work:'วันทำงาน',ot:'OT',expense:'ค่าใช้จ่าย'}[r.kind])+'</strong> <span class="status">'+r.status+'</span>'+description(r)+(r.late?'<p>รายการหลังปิดข้อมูล รอ Owner พิจารณา</p>':'');return box;}
function status(){html('<h2>ตรวจสถานะของฉัน</h2>');const rows=visible();if(!rows.length)html('<p>ยังไม่มีรายการของคุณในโครงการนี้</p>');rows.forEach(r=>$('screen').append(recordCard(r)));}
function review(){
  html('<h2>ตรวจรายการ / กำลังคน</h2>');const rows=visible(),m=M0.metrics(rows);
  html('<div class="row"><div class="card">จำนวนคน<div class="metric">'+m.people+'</div></div><div class="card">วันเข้างานรวมต่อคน<div class="metric">'+m.attendance+'</div></div><div class="card">จำนวนวันทำงานรวม<div class="metric">'+m.manDays+'</div></div><div class="card">OT (ชั่วโมง)<div class="metric">'+m.hours+'</div></div></div><p class="muted">นับเฉพาะรายการที่อนุมัติ · ครึ่งวันนับ 0.5 วัน · วันเข้างานของคนเดียวในวันเดียวไม่นับซ้ำ</p>');
  if(role()==='OWNER')html('<div class="card">ต้นทุนที่อนุมัติของโครงการนี้ <strong>'+money(rows.filter(r=>r.status==='APPROVED').reduce((sum,r)=>sum+M0.amount(r),0))+' บาท</strong></div>');
  else html('<p class="notice">หน้านี้แสดงเฉพาะกำลังคน วันทำงาน และ OT</p>');
  if(!rows.length)html('<p>ยังไม่มีรายการ ให้สวมบทช่างส่งรายการก่อน</p>');
  rows.forEach(r=>{
    const box=recordCard(r);
    if(r.kind==='expense'&&role()==='OWNER'){const div=document.createElement('div');div.className='attachments';box.append(div);showAttachments(r.attachments,div);}
    if(!['APPROVED','REJECTED'].includes(r.status)&&(role()==='OWNER'||role()==='ADMIN'&&r.kind!=='expense')){
      if(r.kind==='expense')box.append(button('แก้ยอดพร้อมเหตุผล',()=>editExpense(r),true));
      box.append(button('อนุมัติ',()=>{r.status='APPROVED';audit.push({actor:actor(),action:'APPROVED',id:r.id});render();say('อนุมัติแล้วโดย '+actor());}),button('ปฏิเสธ',()=>{const reason=prompt('เหตุผลที่ไม่อนุมัติ');if(reason?.trim()){r.status='REJECTED';audit.push({actor:actor(),action:'REJECTED',id:r.id,reason});render();}},true));
    }
    $('screen').append(box);
  });
}
function editExpense(r){
  if(role()!=='OWNER')return;html('');$('screen').innerHTML='<h2>แก้ยอดก่อนอนุมัติ</h2><form id="editForm"><label>ยอด (บาท)<input id="editAmount" type="number" min="0.01" step="0.01" required value="'+r.amount/100+'"></label><label>เหตุผล<textarea id="editReason" required></textarea></label><button>บันทึกการแก้ไข</button></form>';
  $('editForm').onsubmit=e=>{e.preventDefault();const next=Math.round(Number($('editAmount').value)*100);audit.push({actor:actor(),id:r.id,before:r.amount,after:next,reason:$('editReason').value});r.amount=next;render();say('เก็บค่าเดิม ค่าใหม่ เหตุผล และผู้แก้แล้ว');};actions(button('กลับ',render,true));
}
function evidence(){
  if(role()!=='OWNER'){html('<h2>เฉพาะ Owner</h2>');return;}
  html('<h2>ค่าใช้จ่ายรายเดือน / รูปบิล</h2><label>เดือน<input id="month" type="month" value="'+month+'"></label><p>รวมทุกโครงการ · แยกโฟลเดอร์ตามโครงการเมื่อดาวน์โหลด</p>');
  $('month').onchange=e=>{month=e.target.value;render();};
  const rows=records.filter(r=>r.kind==='expense'&&r.date.startsWith(month)),approved=rows.filter(r=>r.status==='APPROVED');
  html('<p>อนุมัติแล้ว '+approved.length+' รายการ · '+money(approved.reduce((s,r)=>s+r.amount,0))+' บาท</p><p>รอตรวจ '+rows.filter(r=>r.status==='PENDING_REVIEW').length+' รายการ (ยังไม่รวมยอด)</p>');
  approved.forEach(r=>{const box=recordCard(r),div=document.createElement('div');div.className='attachments';box.append(div);showAttachments(r.attachments,div);$('screen').append(box);});
  const download=button('ดาวน์โหลดรูปบิลทั้งเดือน (ZIP)',()=>{
    if(role()!=='OWNER')return;
    try{const entries=M0.archiveEntries(records,month),bytes=M0.zip(entries),url=urlFor(bytes,'application/zip'),a=document.createElement('a');a.href=url;a.download='DEMO-EVIDENCE-'+month+'.zip';a.click();say('ดาวน์โหลดแล้ว แตก ZIP จะได้โฟลเดอร์ทั้งเดือน พร้อมไฟล์ที่เลือกจริงและทะเบียนรายการ');}catch(error){say(error.message);}
  });download.disabled=!approved.length;actions(download);
  html('<p class="notice">ชุดนี้มีเฉพาะบิล/ใบเสร็จ/สลิปค่าใช้จ่ายที่อนุมัติแล้วในเดือนที่เลือก ใช้ประกอบงานใน SMEMOVE ซึ่งแยกจากต้นแบบนี้</p><p class="muted">ไฟล์อยู่ใน browser เท่านั้น Refresh แล้วหาย ยังไม่ใช่ระบบสำรองหลักฐานถาวร</p>');
}
function payroll(){
  html('<h2>ตรวจรอบค่าจ้าง · กันยายน 2026</h2><span class="status">'+run+'</span>');
  const source=run==='OPEN'?records.filter(r=>r.kind!=='expense'&&r.status==='APPROVED'&&!r.late&&r.date.startsWith('2026-09')):frozen;
  const m=M0.metrics(source);html('<p>'+m.people+' คน · วันเข้างานรวม '+m.attendance+' · วันทำงานรวม '+m.manDays+' · OT '+m.hours+' ชั่วโมง</p>');
  const pending=records.filter(r=>r.kind!=='expense'&&r.status==='SUBMITTED'&&r.date.startsWith('2026-09')).length;
  if(role()==='ADMIN'){
    if(run==='OPEN')actions(button('ส่งให้ Owner ตรวจ',()=>{if(!source.length||pending){say('ตรวจรายการเวลาให้ครบก่อนส่ง Owner');return;}frozen=source.map(r=>({...r}));run='TIME_REVIEWED';audit.push({actor:actor(),action:run});render();}));
    html('<p>ตรวจวันทำงานและ OT ภายในวันที่ 1 เวลา 10:00 แล้วส่งให้ Owner ตรวจต่อ</p>');return;
  }
  if(run==='OPEN'){say('รอ Admin ตรวจวันทำงานและ OT แล้วส่งมา');return;}
  if(run==='TIME_REVIEWED'){actions(button('คำนวณสรุปจำลอง',()=>{run='OWNER_REVIEW';audit.push({actor:actor(),action:run});render();}));return;}
  html('<details><summary>เปิดดูยอดค่าจ้าง (Owner)</summary><p>อัตราสมมติ 970 บาท/วัน · ยอดรวม '+money(source.reduce((s,r)=>s+M0.amount(r),0))+' บาท</p></details>');
  const next={OWNER_REVIEW:['อนุมัติสรุป','APPROVED'],APPROVED:['Lock รอบ','LOCKED'],LOCKED:['บันทึกโอนจำลอง','PAID']}[run];
  if(next)actions(button(next[0],()=>{run=next[1];audit.push({actor:actor(),action:run});render();}));
  html('<p class="muted">'+audit.filter(a=>!a.id&&a.action).map(a=>esc(a.actor)+' : '+a.action).join(' → ')+'</p>');
  if(run==='PAID')say('บันทึก PAID จำลองแล้ว ไม่มีการโอนเงินจริง');
}
const previous={role:role(),project:project(),sender:sender(),owner:$('owner').value};
for(const id of ['role','project','sender','owner'])$(id).onchange=()=>{
  if(draft&&!confirm('มีข้อมูลยังไม่ได้ส่ง ต้องการละทิ้งหรือไม่?')){$(id).value=previous[id];return;}
  previous[id]=$(id).value;discardDraft();render();
};
$('reset').onclick=()=>{if(confirm('ล้างข้อมูลและไฟล์ทดสอบทั้งหมดในต้นแบบ?')){for(const url of objectUrls)URL.revokeObjectURL(url);objectUrls.clear();records=[];draft=null;frozen=[];audit=[];run='OPEN';sequence=0;page='jobs';render();}};
render();
