import json

paths = [
    '/Users/harsha/Downloads/Sem 5/Foundations of Data Science/DS_Lab_Compiled_Notebook.ipynb',
    '/Users/harsha/Downloads/Sem 5/Foundations of Data Science/DS_Lab_Diabetes.ipynb'
]

for path in paths:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            nb = json.load(f)
            
        changed = False
        for cell in nb.get('cells', []):
            if cell.get('cell_type') == 'code':
                source = "".join(cell.get('source', []))
                if "df4.index = ['f1','f2','f4','f3','f8','f6','f7']" in source:
                    new_source = source.replace(
                        "df4.index = ['f1','f2','f4','f3','f8','f6','f7']", 
                        "df4.index = ['f1','f2','f3','f4','f5']"
                    )
                    
                    lines = [line + '\n' for line in new_source.split('\n')]
                    if lines:
                        lines[-1] = lines[-1].strip('\n')
                    cell['source'] = lines
                    changed = True
                    
        if changed:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(nb, f, indent=1)
            print(f"Fixed df4.index in {path}")
    except Exception as e:
        print(f"Skipped {path}: {e}")
