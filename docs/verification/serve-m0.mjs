// Local-only static preview. This does not deploy the application.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.md':'text/plain'};
http.createServer((req,res)=>{
  let file;
  try {file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));}
  catch {res.writeHead(400).end();return;}
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',(mime[path.extname(file)]||'application/octet-stream')+'; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(data);});
}).listen(4174,'127.0.0.1',()=>console.log('M0 local preview: http://127.0.0.1:4174/prototype/index.html'));
