import {mkdirSync,readFileSync,writeFileSync,cpSync,rmSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const binary=process.env.ESBUILD||join(root,'node_modules','.bin','esbuild');
if(!existsSync(binary))throw new Error('Run npm install first, or set ESBUILD to the esbuild binary path.');
rmSync(join(root,'dist'),{recursive:true,force:true});mkdirSync(join(root,'dist'),{recursive:true});
const result=spawnSync(binary,[join(root,'src','app.js'),'--bundle','--splitting','--format=esm','--target=es2020','--minify',`--outdir=${join(root,'dist')}`,`--alias:three=${join(root,'src','vendor','three.module.js')}`],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
let html=readFileSync(join(root,'src','index.html'),'utf8').replace(/\s*<script type="importmap">.*?<\/script>/,'');
writeFileSync(join(root,'dist','index.html'),html);
cpSync(join(root,'src','assets'),join(root,'dist','assets'),{recursive:true});
// Omit superseded concept illustrations and the larger PNG logo from delivery.
for(const name of ['signature.svg','midnight.svg','heritage.svg','rpm-logo.png'])rmSync(join(root,'dist','assets',name),{force:true});
const css=spawnSync(binary,[join(root,'src','styles.css'),'--minify',`--outfile=${join(root,'dist','styles.css')}`],{stdio:'inherit'});
if(css.status!==0)process.exit(css.status||1);
cpSync(join(root,'src','vendor','LICENSE'),join(root,'dist','THREE-LICENSE.txt'));
console.log('Static server build is ready in prototype/dist.');
