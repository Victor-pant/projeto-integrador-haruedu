from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = 'chave_secreta_para_projeto_univesp' # Necessário para usar sessões

# Dados fictícios para teste (Depois você pode evoluir para SQLite)
USER_DATA = {
    "admin": "haru123",
    "gestor": "unoeste2026"
}

@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Verifica se o usuário existe e a senha bate
        if username in USER_DATA and USER_DATA[username] == password:
            session['logged_in'] = True
            session['username'] = username
            return redirect(url_for('dashboard'))
        else:
            error = 'Usuário ou senha inválidos. Tente novamente.'
            
    return render_template('login.html', error=error)

@app.route('/dashboard')
def dashboard():
    # Proteção: Se não estiver logado, volta para o login
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)