import os
import pandas as pd

paths = [
    r'C:\Users\Asus\Downloads', 
    r'C:\Users\Asus\Desktop', 
    r'C:\Users\Asus\Music'
]

with open('cols.txt', 'w') as out:
    for d in paths:
        if not os.path.exists(d):
            continue
        for root, _, files in os.walk(d):
            for file in files:
                if 'MUJ' in file and file.endswith('.csv'):
                    f = os.path.join(root, file)
                    try:
                        df = pd.read_csv(f, nrows=0)
                        out.write(f"File: {file}\nColumns: {list(df.columns)}\n\n")
                    except:
                        pass
