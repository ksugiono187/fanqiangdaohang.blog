import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const base=path.resolve(import.meta.dirname,'../dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{let f=path.resolve(base,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f!==base&&!f.startsWith(base+path.sep)){res.writeHead(403).end();return;}if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)){res.writeHead(404,{'Content-Type':types['.html']});res.end(fs.readFileSync(path.join(base,'404.html')));return;}res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});res.end(fs.readFileSync(f));}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
