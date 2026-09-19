import json

path_nba = '/Users/harsha/Downloads/Sem 5/Foundations of Data Science/DS_Lab_Compiled_Notebook.ipynb'
path_diabetes = '/Users/harsha/Downloads/Sem 5/Foundations of Data Science/DS_Lab_Diabetes.ipynb'

def fix_notebook(file_path, dataset_type):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            nb = json.load(f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return

    def format_source(code_str):
        lines = [line + '\n' for line in code_str.split('\n')]
        if lines:
            lines[-1] = lines[-1].strip('\n')
        return lines

    for cell in nb.get('cells', []):
        if cell.get('cell_type') == 'code':
            source = "".join(cell.get('source', []))
            
            # Fix Cell 26 (Horizontal Seaborn Barplot)
            if "sns.barplot(x='fare', y='who'" in source:
                if dataset_type == 'nba':
                    new_code = """sns.barplot(x='Salary', y='Position', data=df_grouped, palette='Blues')
plt.title('Total Salary by Position (Seaborn)')
plt.xlabel('Total Salary')
plt.ylabel('Position')
plt.show()"""
                else:
                    new_code = """sns.barplot(x='Glucose', y='Outcome', data=df_grouped, palette='Blues', orient='h')
plt.title('Average Glucose by Outcome (Seaborn)')
plt.xlabel('Average Glucose')
plt.ylabel('Outcome')
plt.show()"""
                cell['source'] = format_source(new_code)
            
            # Fix Cell 27 (Matplotlib Column Chart)
            elif "plt.bar(df['who'], df['fare']" in source:
                if dataset_type == 'nba':
                    new_code = """plt.bar(df_grouped['Position'], df_grouped['Salary'], color=['#F0F8FF', '#E6E6FA', '#B0E0E6', 'blue', 'green'])
plt.title('Total Salary by Position (Column Chart)')
plt.xlabel('Position')
plt.ylabel('Total Salary')
plt.show()"""
                else:
                    new_code = """plt.bar(df_grouped['Outcome'].astype(str), df_grouped['Glucose'], color=['#F0F8FF', '#E6E6FA'])
plt.title('Average Glucose by Outcome (Column Chart)')
plt.xlabel('Outcome')
plt.ylabel('Average Glucose')
plt.show()"""
                cell['source'] = format_source(new_code)
                
            # Fix Cell 28 (Vertical Seaborn Barplot)
            elif "sns.barplot(x='who', y='fare'" in source:
                if dataset_type == 'nba':
                    new_code = """sns.barplot(x='Position', y='Salary', data=df_grouped, palette='Blues')
plt.title('Total Salary by Position (Seaborn)')
plt.xlabel('Position')
plt.ylabel('Total Salary')
plt.show()"""
                else:
                    new_code = """sns.barplot(x='Outcome', y='Glucose', data=df_grouped, palette='Blues')
plt.title('Average Glucose by Outcome (Seaborn)')
plt.xlabel('Outcome')
plt.ylabel('Average Glucose')
plt.show()"""
                cell['source'] = format_source(new_code)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1)

fix_notebook(path_nba, 'nba')
fix_notebook(path_diabetes, 'diabetes')

print("Notebooks fixed successfully!")
