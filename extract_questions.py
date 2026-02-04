import sqlite3
import json

def get_questions():
    conn = sqlite3.connect('legacy-flask/respostas.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM perguntas")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        return str(e)
    finally:
        conn.close()

if __name__ == "__main__":
    print(json.dumps(get_questions()))
