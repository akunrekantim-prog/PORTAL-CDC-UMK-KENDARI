import json
import re

with open('src/data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = 'export const SEED_DOKUMEN_AKREDITASI: DokumenAkreditasi[] = ['
start = content.find(start_marker)
if start != -1:
    end = content.find('\n];\n', start)
    if end == -1:
        end = content.find('];', start)
    block = content[start + len(start_marker) - 1 : end + 2]
    
    # Split items by { id:
    chunks = block.split('{')
    items = []
    for chunk in chunks:
        if 'id:' not in chunk or 'prodi:' not in chunk:
            continue
        def get_val(key):
            m = re.search(r'\b' + key + r':\s*(?:\'([^\']*)\'|"([^"]*)"|(\d+))', chunk)
            if m:
                if m.group(3) is not None:
                    return int(m.group(3))
                return m.group(1) if m.group(1) is not None else m.group(2)
            return None
        
        item_id = get_val('id')
        prodi = get_val('prodi')
        if item_id and prodi:
            items.append({
                'id': item_id,
                'fakultas': get_val('fakultas') or '',
                'kodeFakultas': get_val('kodeFakultas') or '',
                'prodi': prodi,
                'jenjang': get_val('jenjang') or 'S1',
                'statusAkreditasi': get_val('statusAkreditasi') or 'UNGGUL',
                'nomorSk': get_val('nomorSk'),
                'tahunAkreditasi': get_val('tahunAkreditasi'),
                'masaBerlaku': get_val('masaBerlaku'),
                'lembaga': get_val('lembaga') or 'LAMDIK',
                'fileUrl': None,
                'websiteFakultas': get_val('websiteFakultas'),
                'logoFakultasUrl': get_val('logoFakultasUrl'),
                'urutan': get_val('urutan') or 0
            })
            
    print(f'Successfully parsed {len(items)} prodi akreditasi')
    with open('scripts/supabase_snapshot.json', 'r', encoding='utf-8') as f2:
        snap = json.load(f2)
    snap['dokumen_akreditasis'] = items
    with open('scripts/supabase_snapshot.json', 'w', encoding='utf-8') as f2:
        json.dump(snap, f2, ensure_ascii=False, indent=2)
    print('Updated scripts/supabase_snapshot.json successfully!')
