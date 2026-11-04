// Match exported meshes to source solids using all six bounding-box coordinates.
// A match is accepted only if every matching source solid agrees on its layer.
const fs=require('node:fs');
const audit=JSON.parse(fs.readFileSync('.local-cache/rhino-layer-audit.json','utf8'));
const model=JSON.parse(fs.readFileSync('99_development/diagnostics/model-diagnosis.json','utf8'));
const obj=JSON.parse(fs.readFileSync('99_development/diagnostics/obj-object-map.json','utf8'));
const sanitize=s=>s.replace(/[^\x21-\x7e]/g,'_');
const solids=audit.objects.filter(o=>!o.is_definition && ['Brep','Extrusion','Mesh','Surface'].includes(o.type) && o.minimum && o.maximum);
const result={source_3dm_sha256:audit.source_sha256,source_unchanged:audit.source_unchanged,tolerance_mm:1,
  method:'All six world-space bbox coordinates within 1mm, source layer agrees with sanitized OBJ group, all candidates agree on layer',matches:{},unmatched:[],ambiguous:[]};
const counts={};
for(const mesh of model.objects){
  const group=obj[mesh.name]?.group;
  const values=[...mesh.minimum,...mesh.maximum].map(x=>x*1000);
  const candidates=solids.filter(o=>sanitize(o.layer.name)===group && [...o.minimum,...o.maximum].every((v,i)=>Math.abs(v-values[i])<=1));
  const layers=[...new Set(candidates.map(o=>o.layer.full_path))];
  if(layers.length===1){
    result.matches[mesh.name]={layer:layers[0],layer_index:candidates[0].layer_index,source_ids:candidates.map(o=>o.id),
      maximum_bbox_error_mm:Math.max(...candidates.flatMap(o=>[...o.minimum,...o.maximum].map((v,i)=>Math.abs(v-values[i]))))};
    counts[layers[0]]=(counts[layers[0]]||0)+1;
  }else if(layers.length>1)result.ambiguous.push({name:mesh.name,layers});
  else result.unmatched.push(mesh.name);
}
result.counts=counts;
fs.writeFileSync('99_development/diagnostics/rhino-layer-matches.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({counts,matched:Object.keys(result.matches).length,unmatched:result.unmatched.length,ambiguous:result.ambiguous.length},null,2));
