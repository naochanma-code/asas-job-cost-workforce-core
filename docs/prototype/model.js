/* M0 local simulation helpers only. No server, persistence, authentication or real payment. */
var M0 = (() => {
  'use strict';
  const categories = [
    ['FUEL', 'ค่าน้ำมัน'], ['TRAVEL', 'ค่าเดินทาง / ทางด่วน / ที่จอดรถ'],
    ['ACCOMMODATION', 'ค่าที่พัก'], ['MEAL', 'ค่าอาหาร / เบี้ยเลี้ยงตามบิล'],
    ['MATERIAL_DIRECT', 'วัสดุซื้อใช้ตรงกับงาน'], ['HARDWARE_DIRECT', 'อุปกรณ์ซื้อใช้ตรงกับงาน'],
    ['SUBCONTRACTOR', 'ค่าผู้รับเหมาช่วง'], ['TRANSPORT', 'ค่าขนส่ง'], ['OTHER', 'ค่าใช้จ่ายอื่น ๆ']
  ];
  const dayFraction = r => r.part === 'FULL' ? 1 : 0.5;
  function metrics(rows) {
    const approved = rows.filter(r => r.status === 'APPROVED');
    const work = approved.filter(r => r.kind === 'work');
    return {
      people: new Set(work.map(r => r.sender)).size,
      attendance: new Set(work.map(r => r.sender + ':' + r.date)).size,
      manDays: work.reduce((sum, r) => sum + dayFraction(r), 0),
      hours: approved.filter(r => r.kind === 'ot').reduce((sum, r) => sum + r.hours, 0)
    };
  }
  function overlap(rows, candidate) {
    if (candidate.kind !== 'work') return false;
    return rows.some(r => r.kind === 'work' && !['REJECTED', 'CANCELLED'].includes(r.status) &&
      r.sender === candidate.sender && r.date === candidate.date &&
      (r.part === 'FULL' || candidate.part === 'FULL' || r.part === candidate.part));
  }
  const validOtHours = hours => Number.isFinite(hours) && hours > 0 && Number.isInteger(hours * 2);
  function amount(r) {
    if (r.kind === "ot" && !validOtHours(r.hours)) throw Error("OT ต้องเพิ่มทีละ 0.5 ชั่วโมง");
    if (r.kind === 'expense') return r.amount;
    // All rate/calendar values below are synthetic fixtures. Work date owns all OT hours.
    const holiday = new Date(r.date + 'T12:00:00Z').getUTCDay() === 0 || r.date === '2026-09-28';
    if (r.kind === 'ot') return (holiday ? 36400 : 24300) * r.hours;
    return (97000 * (holiday ? 2 : 1) + 12000) * dayFraction(r);
  }
  function timeProjection(r) {
    return { id:r.id, kind:r.kind, sender:r.sender, project:r.project, job:r.job,
      date:r.date, part:r.part, hours:r.hours, status:r.status, late:r.late };
  }
  function canSeeExpense(role, sender, record) {
    return role === 'OWNER' || role === 'ADMIN' || (role === 'TECH' && record.sender === sender);
  }
  function mime(bytes) {
    if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) return ['image/png','png'];
    if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return ['image/jpeg','jpg'];
    if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP') return ['image/webp','webp'];
    if (bytes.length >= 5 && String.fromCharCode(...bytes.slice(0,5)) === '%PDF-') return ['application/pdf','pdf'];
    throw new Error('รองรับ JPG, PNG, WebP หรือ PDF ที่มีชนิดไฟล์ถูกต้องเท่านั้น');
  }
  function crc32(data) {
    let crc = 0xffffffff;
    for (const byte of data) { crc ^= byte; for (let i=0;i<8;i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
    return (crc ^ 0xffffffff) >>> 0;
  }
  function zip(entries) {
    // ZIP STORE for a bounded local prototype. Production exporter is a separate future module.
    const encoder = new TextEncoder(), parts = [], directory = [];
    let offset = 0;
    const names = new Set();
    for (const entry of entries) {
      if (!/^[A-Za-z0-9_./-]+$/.test(entry.name) || entry.name.startsWith('/') || entry.name.split('/').includes('..') || names.has(entry.name)) throw new Error('Invalid archive path');
      names.add(entry.name);
      const name = encoder.encode(entry.name), data = entry.data, checksum = crc32(data);
      const local = new Uint8Array(30 + name.length), h = new DataView(local.buffer);
      h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(12,33,true);
      h.setUint32(14,checksum,true); h.setUint32(18,data.length,true); h.setUint32(22,data.length,true);
      h.setUint16(26,name.length,true); local.set(name,30);
      const central = new Uint8Array(46 + name.length), c = new DataView(central.buffer);
      c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true); c.setUint16(14,33,true);
      c.setUint32(16,checksum,true); c.setUint32(20,data.length,true); c.setUint32(24,data.length,true);
      c.setUint16(28,name.length,true); c.setUint32(42,offset,true); central.set(name,46);
      parts.push(local,data); directory.push(central); offset += local.length + data.length;
    }
    const dirSize = directory.reduce((s,d)=>s+d.length,0), end = new Uint8Array(22), e = new DataView(end.buffer);
    e.setUint32(0,0x06054b50,true); e.setUint16(8,entries.length,true); e.setUint16(10,entries.length,true);
    e.setUint32(12,dirSize,true); e.setUint32(16,offset,true);
    const result = new Uint8Array(offset+dirSize+end.length);
    let cursor=0; for(const data of [...parts,...directory,end]) {result.set(data,cursor);cursor+=data.length;}
    return result;
  }
  function archiveEntries(records, month) {
    const entries=[], manifest=['expense_id,date,project,job,category,status,amount_satang,evidence_count'];
    for(const r of records.filter(r=>r.kind==='expense' && r.status==='APPROVED' && r.date.startsWith(month))) {
      manifest.push([r.id,r.date,r.project,r.job||'',r.category,r.status,r.amount,r.attachments.length].join(','));
      r.attachments.forEach((f,i)=>entries.push({
        name:month.replace('-','/')+'/DEMO-PRJ-'+r.project+(r.job?'/DEMO-JOB-'+r.job:'')+'/'+r.date.replaceAll('-','')+'_DEMO-PRJ-'+r.project+'_'+r.id+'_'+String(i+1).padStart(2,'0')+'.'+f.ext,
        data:f.bytes
      }));
    }
    if (!entries.length) throw new Error('ยังไม่มีหลักฐานที่อนุมัติในเดือนนี้');
    entries.push({name:month.replace('-','/')+'/expenses.csv',data:new TextEncoder().encode('\ufeff'+manifest.join('\r\n')+'\r\n')});
    return entries;
  }
  return {validOtHours,categories,dayFraction,metrics,overlap,amount,timeProjection,canSeeExpense,mime,crc32,zip,archiveEntries};
})();
