"""Read-only source-layer audit. Never calls File3dm.Write or saves the model."""
import sys, json, hashlib, collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'.local-cache/python'))
import rhino3dm as r
source=Path(sys.argv[1])
def sha():
    with source.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
before=sha()
model=r.File3dm.Read(str(source))
assert model is not None
layers={l.Index:dict(index=l.Index,name=l.Name,full_path=l.FullPath,id=str(l.Id),parent_id=str(l.ParentLayerId),visible=l.Visible) for l in model.Layers}
objects=[];errors=[]
for o in model.Objects:
    a=o.Attributes;g=o.Geometry
    entry=dict(id=str(a.Id),name=a.Name,layer_index=a.LayerIndex,layer=layers.get(a.LayerIndex),
               type=type(g).__name__,is_definition=a.IsInstanceDefinitionObject,visible=a.Visible)
    try:
        b=g.GetBoundingBox()
        entry['minimum']=[b.Min.X,b.Min.Y,b.Min.Z]
        entry['maximum']=[b.Max.X,b.Max.Y,b.Max.Z]
    except Exception as e:errors.append(dict(id=entry['id'],error=str(e)))
    if isinstance(g,r.InstanceReference):
        entry['definition_id']=str(g.ParentIdefId)
        entry['transform']=[[getattr(g.Xform,f'M{i}{j}') for j in range(4)] for i in range(4)]
    objects.append(entry)
definitions=[]
for d in model.InstanceDefinitions:
    definitions.append(dict(id=str(d.Id),name=d.Name,object_ids=[str(i) for i in d.GetObjectIds()]))
after=sha();assert before==after
report=dict(source_name=source.name,source_bytes=source.stat().st_size,source_sha256=before,source_unchanged=True,
    unit_system=str(model.Settings.ModelUnitSystem),layers=list(layers.values()),objects=objects,definitions=definitions,errors=errors)
target=ROOT/'.local-cache/rhino-layer-audit.json'
target.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
counts=collections.Counter(layers.get(o['layer_index'],{}).get('full_path','?') for o in objects)
print(json.dumps(dict(layer_count=len(layers),object_count=len(objects),
    error_count=len(errors),unit_system=report['unit_system'],unchanged=True),ensure_ascii=True),flush=True)
