// Milestone 0 document/fixture validation only. No application, network, database or real data.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'../..');
const results=[];
function check(name,fn){fn();results.push({name,result:'PASS'});}
// Exact rational arithmetic. Expected amounts are independent hand-worked golden fixtures.
const halfUp=(numerator,denominator)=>(2n*numerator+denominator)/(2n*denominator);
function calculate({daily=97000n,half=false,holiday=false,minutes=0n,approved=true,adjustment=0n}){
  if(!approved)return 0n;
  const divisor=half?2n:1n;
  const labour=daily*(holiday?2n:1n)/divisor;
  const meal=12000n/divisor;
  const hourly=halfUp(daily*(holiday?3n:2n),800n);
  const otNumerator=hourly*100n*minutes;
  assert.equal(otNumerator%60n,0n,'sub-satang fixture requires Q-03; do not invent rounding');
  return labour+meal+otNumerator/60n+adjustment;
}
const cases=[
 ['P-01',{},109000n],['P-02',{half:true},54500n],['P-03',{half:true},54500n],
 ['P-04',{holiday:true},206000n],['P-05',{holiday:true,half:true},103000n],
 ['P-06',{minutes:120n},157600n],['P-07',{holiday:true,minutes:120n},278800n],
 ['P-08',{half:true,minutes:90n},90950n],['P-09',{half:true,holiday:true,minutes:30n},121200n],
 ['P-10',{holiday:true},206000n],['P-11',{approved:false},0n],['P-12',{approved:false,minutes:120n},0n],
 ['P-13',{adjustment:5000n},114000n],['P-15',{daily:100000n,minutes:60n},137000n],['P-16',{minutes:180n},181900n]
];
for(const [id,input,expected] of cases)check(id,()=>assert.equal(calculate(input),expected));
check('P-14 effective-rate example arithmetic',()=>assert.equal(calculate({})+calculate({daily:100000n}),221000n));
check('970 hourly rounding 243/364',()=>{assert.equal(halfUp(97000n*2n,800n),243n);assert.equal(halfUp(97000n*3n,800n),364n)});
check('monthly Payroll 568500 / cost 613500',()=>{const work=calculate({minutes:120n})+calculate({half:true})+calculate({holiday:true,minutes:60n})+calculate({});assert.equal(work,563500n);assert.equal(work+5000n,568500n);assert.equal(work+50000n,613500n)});
check('E-01 evidence rows do not duplicate expense total',()=>{const expenses=[{id:'DEMO-E1',amount:50000,files:2},{id:'DEMO-E2',amount:130000,files:1}];assert.equal(expenses.reduce((s,e)=>s+e.amount,0),180000);assert.equal(expenses.reduce((s,e)=>s+e.files,0),3)});
check('calendar fixtures, not application date logic',()=>{assert.equal(new Date(Date.UTC(2028,2,0)).getUTCDate(),29);assert.equal(new Date(Date.UTC(2027,2,0)).getUTCDate(),28);const f=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'});assert.equal(f.format(new Date('2026-09-30T16:59:59Z')),'2026-09-30');assert.equal(f.format(new Date('2026-09-30T17:00:00Z')),'2026-10-01')});
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else files.push(p)}}
walk(path.join(root,'docs'));
check('Markdown local links exist',()=>{for(const file of files.filter(p=>p.endsWith('.md'))){const text=fs.readFileSync(file,'utf8');for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const link=m[1];if(/^(https?:|#)/.test(link))continue;assert.ok(fs.existsSync(path.resolve(path.dirname(file),link.split('#')[0])),`${file}: missing ${link}`)}}});
check('Mermaid fences balanced',()=>{for(const file of files.filter(p=>p.endsWith('.md'))){const fences=fs.readFileSync(file,'utf8').match(/^```/gm)||[];assert.equal(fences.length%2,0,file)}});
check('prototype JavaScript parses and has no remote dependency',()=>{const html=fs.readFileSync(path.join(root,'docs/prototype/index.html'),'utf8');const paths=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);assert.equal(paths.length,2);const scripts=paths.map(p=>fs.readFileSync(path.join(root,'docs/prototype',p),'utf8'));scripts.forEach(s=>new vm.Script(s));assert.ok(!/<(?:script|link|iframe)[^>]+(?:src|href)=["']https?:/i.test(html));assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket)\b/.test(scripts.join('\n')))});
check('required deliverables present',()=>{for(const p of ['WIREFLOWS.md','STATE_DIAGRAMS.md','DATA_DICTIONARY.md','PERMISSION_MATRIX.md','PAYROLL_CALCULATION_TEST_CASES.md','ACCOUNTING_EVIDENCE.md','PILOT_ACCEPTANCE_SCRIPT.md','OWNER_QUESTIONS.md','PROJECT_STATUS.md','CHANGELOG.md','TEST_EVIDENCE.md'])assert.ok(fs.existsSync(path.join(root,'docs',p)),p)});
process.stdout.write(JSON.stringify({scope:'M0 fixtures and document consistency only; not production/integration/UAT',checks:results.length,results},null,2)+'\n');
