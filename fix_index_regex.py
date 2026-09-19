import json
import re

paths = [
    '/Users/harsha/Downloads/Sem 5/Foundations of Data Science/DS_Lab_Compiled_Notebook.ipynb',
    '/Users/harsha/Downloads/Sem 5/Foundations of Data Science/DS_Lab_Diabetes.ipynb'
]

for path in paths:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            nb = json.load(f)
            
        changed = False
        for i, cell in enumerate(nb.get('cells', [])):
            if cell.get('cell_type') == 'code':
                source_lines = cell.get('source', [])
                source_str = "".join(source_lines)
                
                # Check for the pattern regardless of spacing
                if 'f1' in source_str and 'f7' in source_str and 'df4.index' in source_str:
                    new_source_str = re.sub(r"df4\.index\s*=\s*\[.*?\]", "df4.index = ['f1','f2','f3','f4','f5']", source_str)
                    
                    if new_source_str != source_str:
                        # Convert back to list of lines
                        lines = [line + '\n' for line in new_source_str.split('\n')]
                        if lines:
                            lines[-1] = lines[-1].strip('\n')
                        cell['source'] = lines
                        changed = True
                        print(f"Replaced in cell {i} in {path}")
                    
        if changed:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(nb, f, indent=1)
            print(f"Saved {path}")
    except Exception as e:
        print(f"Error {path}: {e}")
