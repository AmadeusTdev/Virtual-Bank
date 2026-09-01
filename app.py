import os
import sys
import json
import webview
from cryptography.fernet import Fernet

def get_resource_path(relative_path):
    """ Renvoie le chemin absolu vers la ressource """
    if getattr(sys, 'frozen', False):
        # En mode compilé (Nuitka --standalone), le dossier de l'exe est la racine
        base_path = os.path.dirname(sys.executable)
    else:
        # En mode développement (python app.py)
        base_path = os.path.dirname(os.path.abspath(__file__))

    return os.path.join(base_path, relative_path)

class API:
    def __init__(self):
        appdata_path = os.getenv('APPDATA')
        self.folder_path = os.path.join(appdata_path, 'vbankmonitor')
        self.file_path = os.path.join(self.folder_path, 'VBankMonitorData.json')
        self.key_path = os.path.join(self.folder_path, 'secret.key')
        
        os.makedirs(self.folder_path, exist_ok=True)
        self.key = self._obtenir_ou_creer_cle()
        self.cipher = Fernet(self.key)

    def _obtenir_ou_creer_cle(self):
        """Récupère la clé existante ou en génère une nouvelle."""
        if os.path.exists(self.key_path):
            with open(self.key_path, 'rb') as key_file:
                return key_file.read()
        else:
            key = Fernet.generate_key()
            with open(self.key_path, 'wb') as key_file:
                key_file.write(key)
            return key

    def charger_donnees_auto(self):
        if not os.path.exists(self.file_path):
            return {'success': True, 'data': {}}
        try:
            with open(self.file_path, 'rb') as f:
                encrypted_data = f.read()
            
            # Déchiffrement des données
            decrypted_data = self.cipher.decrypt(encrypted_data)
            data = json.loads(decrypted_data.decode('utf-8'))
            
            return {'success': True, 'data': data}
        except Exception as e:
            return {'success': False, 'error': f"Erreur de déchiffrement ou de lecture : {str(e)}"}

    def sauvegarder_donnees_auto(self, data):
        try:
            # Convertir l'objet JSON en chaîne de texte, puis en octets
            json_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
            
            # Chiffrement des données
            encrypted_data = self.cipher.encrypt(json_bytes)
            
            with open(self.file_path, 'wb') as f:
                f.write(encrypted_data)
                
            return {'success': True, 'path': self.file_path}
        except Exception as e:
            return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    api = API()

    html_path = get_resource_path('src/index.html')

    # print("Chemin du fichier HTML :", html_path)
    # print("Le fichier existe-t-il ?", os.path.exists(html_path))
    
    window = webview.create_window(
        title='VBank Monitor',
        url=html_path,
        js_api=api,
        width=1300,
        height=768,
    )

    icon_path = get_resource_path('icon.ico')
    
    webview.start(gui='edgechromium', debug=not True)