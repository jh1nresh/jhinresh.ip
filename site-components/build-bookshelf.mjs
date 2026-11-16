import * as esbuild from 'esbuild';
import {readFile,writeFile,mkdir,copyFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('../assets/bookshelf');
await mkdir(out,{recursive:true});
const result=await esbuild.build({entryPoints:['bookshelf-entry.tsx'],bundle:true,format:'iife',platform:'browser',target:['es2020'],outfile:path.join(out,'bookshelf.js'),minify:true,metafile:true,legalComments:'external',define:{'process.env.NODE_ENV':'"production"'}});
const packages=new Set();
for(const output of Object.values(result.metafile.outputs))for(const [file,info] of Object.entries(output.inputs)){if(!info.bytesInOutput)continue;const found=file.match(/^(node_modules\/(?:@[^/]+\/)?[^/]+)/);if(found)packages.add(found[1]);}
let notices='Interactive bookshelf adapted from Aditya Ojha (MIT). See LICENSE.\n';
for(const directory of [...packages].sort()){
 const pkg=JSON.parse(await readFile(path.join(directory,'package.json'),'utf8'));
 notices+=`\n--- ${pkg.name} ${pkg.version} (${pkg.license || 'see notice'}) ---\n`;
 for(const file of (await readdir(directory)).filter(name=>/^(licen[sc]e|copying|notice)([.-]|$)/i.test(name)))notices+=await readFile(path.join(directory,file),'utf8')+'\n';
}
await writeFile(path.join(out,'THIRD_PARTY_NOTICES.txt'),notices.trimEnd()+'\n');
await copyFile('LICENSE.upstream',path.join(out,'LICENSE'));
await writeFile('bookshelf-build-metafile.json',JSON.stringify(result.metafile,null,2)+'\n');
for(const file of ['bookshelf.js','bookshelf.css'])console.log(file,(await stat(path.join(out,file))).size,'bytes');
