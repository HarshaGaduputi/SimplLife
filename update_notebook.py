import json
import os

path = '/Users/harsha/Downloads/Sem 5/Foundations of Data Science/DS_Lab_Compiled_Notebook.ipynb'
out_path_diabetes = '/Users/harsha/Downloads/Sem 5/Foundations of Data Science/DS_Lab_Diabetes.ipynb'

try:
    with open(path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
except Exception as e:
    print(f"Error reading notebook: {e}")
    exit(1)

nba_code = """import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load NBA dataset
df_nba = pd.read_csv('nba.csv')
print("NBA Columns:", df_nba.columns.tolist())

try:
    # Example plotting (update column names if they differ in your CSV)
    df_nba_clean = df_nba.dropna(subset=['Position', 'Salary'])
    df_grouped = df_nba_clean.groupby('Position')['Salary'].sum().to_frame().reset_index()
    
    plt.barh(df_grouped['Position'], df_grouped['Salary'], color=['blue', 'green', 'red', 'orange', 'purple'])
    plt.title('Total Salary by Position')
    plt.xlabel('Total Salary')
    plt.ylabel('Position')
    plt.show()
except KeyError:
    print("Please update 'Position' and 'Salary' to the correct column names from the list above.")
"""

diabetes_code = """import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load Diabetes dataset
df_diabetes = pd.read_csv('diabetes.csv')
print("Diabetes Columns:", df_diabetes.columns.tolist())

try:
    # Example plotting (update column names if they differ in your CSV)
    df_grouped = df_diabetes.groupby('Outcome')['Glucose'].mean().to_frame().reset_index()
    
    plt.bar(df_grouped['Outcome'].astype(str), df_grouped['Glucose'], color=['blue', 'green'])
    plt.title('Average Glucose by Outcome')
    plt.xlabel('Outcome')
    plt.ylabel('Average Glucose')
    plt.show()
except KeyError:
    print("Please update 'Outcome' and 'Glucose' to the correct column names from the list above.")
"""

def format_source(code_str):
    lines = [line + '\n' for line in code_str.split('\n')]
    if lines:
        lines[-1] = lines[-1].strip('\n')
    return lines

cell_found = False
for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = "".join(cell.get('source', []))
        if 'sns.load_dataset(\'titanic\')' in source or 'sns.load_dataset("titanic")' in source:
            cell['source'] = format_source(nba_code)
            cell_found = True

with open(path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

# Reload and create diabetes version
with open(path, 'r', encoding='utf-8') as f:
    nb_diabetes = json.load(f)

for cell in nb_diabetes.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = "".join(cell.get('source', []))
        if 'df_nba = pd.read_csv' in source or ('sns.load_dataset' in source and 'titanic' in source):
            cell['source'] = format_source(diabetes_code)

with open(out_path_diabetes, 'w', encoding='utf-8') as f:
    json.dump(nb_diabetes, f, indent=1)

if cell_found:
    print("Successfully updated DS_Lab_Compiled_Notebook.ipynb and created DS_Lab_Diabetes.ipynb!")
else:
    print("Warning: Could not find the titanic load_dataset code cell in the notebook. No modifications made.")
