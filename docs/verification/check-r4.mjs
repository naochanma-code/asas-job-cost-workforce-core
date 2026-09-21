// M0 synthetic contracts; not server authorization.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({TextEncoder,Uint8Array,DataView});
vm.runInContext(fs.readFileSync(new URL('../prototype/model.js',import.meta.url),'utf8'),context);
const M=context.M0,results=[];
function check(name,fn){fn();results.push({name,result:'PASS'});}
check('manager delegate in allowed project; TECH cannot impersonate',()=>{for(const role of ['OWNER','ADMIN','PM'])assert.equal(M.canSubmitTime(role,'DEMO-'+role,'DEMO-T2','B'),true);assert.equal(M.canSubmitTime('TECH','DEMO-T1','DEMO-T2','B'),false);assert.equal(M.canSubmitTime('TECH','DEMO-T1','DEMO-T1','A'),true);});
check('PM outside assigned project and unknown employee denied',()=>{assert.equal(M.canSubmitTime('PM','DEMO-PM','DEMO-T2','A'),false);assert.equal(M.canSubmitTime('OWNER','DEMO-OWNER-1','UNKNOWN','B'),false);});
check('PM owns only submitted expense; employee identity not an ownership bypass',()=>{const r={sender:'DEMO-T1',submittedBy:'DEMO-PM'};assert.equal(M.canSeeExpense('PM','DEMO-PM',r),true);assert.equal(M.canSeeExpense('PM','DEMO-OTHER',r),false);assert.equal(M.canSeeExpense('TECH','DEMO-T1',r),false);for(const role of ['OWNER','ADMIN'])assert.equal(M.canSeeExpense(role,'any',r),true);});
check('submission status never auto approves, separate reviewer capability',()=>{assert.equal(M.initialStatus('expense'),'PENDING_REVIEW');for(const role of ['TECH','PM'])assert.equal(M.canReviewExpense(role),false);for(const role of ['OWNER','ADMIN'])assert.equal(M.canReviewExpense(role),true);});
check('overlap uses employee across different submitters',()=>{const row={kind:'work',sender:'DEMO-T2',submittedBy:'DEMO-ADMIN',date:'2026-09-22',project:'A',part:'FULL',status:'SUBMITTED'};assert.equal(M.overlap([row],{...row,submittedBy:'DEMO-PM',project:'B'}),true);assert.equal(M.overlap([row],{...row,sender:'DEMO-T1'}),false);});
check('time projection keeps attribution without money',()=>{const r=M.timeProjection({submittedBy:'DEMO-PM',sender:'DEMO-T2',sourceChannel:'WEB',amount:500,rate:970});assert.equal(r.submittedBy,'DEMO-PM');assert.equal(r.sender,'DEMO-T2');assert.equal(r.sourceChannel,'WEB');assert.ok(!('amount' in r));assert.ok(!('rate' in r));});
check('pending LINE expenses from every role excluded from monthly archive',()=>{const rows=['TECH','PM','ADMIN','OWNER'].map(role=>({kind:'expense',submittedBy:role,sourceChannel:'LINE',status:M.initialStatus('expense'),date:'2026-09-21',attachments:[]}));assert.throws(()=>M.archiveEntries(rows,'2026-09'));});
process.stdout.write(JSON.stringify({scope:'M0-R4 delegate and submission contracts',checks:results.length,results},null,2)+'\n');
