from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import io
import zipfile
from datetime import datetime
from rembg import remove
from PIL import Image
import tempfile
import shutil
import json
from werkzeug.utils import secure_filename
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import traceback
from pyoxipng import optimize

app = Flask(__name__)
CORS(app)

# Configuración
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
ALLOWED_EXTENSIONS = {
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp', 
    'raw', 'psd', 'svg', 'eps', 'ai', 'heic', 'heif'
}

# Crear carpetas necesarias
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

class ImageProcessor:
    def __init__(self):
        self.processing_status = {}
        
    def allowed_file(self, filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
    def extract_images_from_zip(self, zip_path, extract_to):
        """Extrae imágenes de un archivo ZIP"""
        extracted_images = []
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                for file_info in zip_ref.filelist:
                    if not file_info.is_dir():
                        filename = os.path.basename(file_info.filename)
                        if self.allowed_file(filename):
                            # Extraer archivo
                            source = zip_ref.open(file_info)
                            target_path = os.path.join(extract_to, secure_filename(filename))
                            with open(target_path, 'wb') as target:
                                shutil.copyfileobj(source, target)
                            extracted_images.append(target_path)
            return extracted_images
        except Exception as e:
            print(f"Error extrayendo ZIP: {str(e)}")
            return []
    
    def get_image_info(self, image_path):
        """Obtiene información básica de la imagen"""
        try:
            with Image.open(image_path) as img:
                size = os.path.getsize(image_path)
                return {
                    'width': img.width,
                    'height': img.height,
                    'size': size,
                    'format': img.format
                }
        except Exception:
            return None
    
    def remove_background(self, input_path, output_path):
        """Elimina el fondo de una imagen"""
        try:
            with open(input_path, 'rb') as inp:
                background_output = remove(inp.read())
                with open(output_path, 'wb') as outp:
                    outp.write(background_output)
            return True
        except Exception as e:
            print(f"Error eliminando fondo: {str(e)}")
            return False
    
    def resize_image(self, input_path, output_path, width, height):
        """Redimensiona una imagen"""
        try:
            with Image.open(input_path) as img:
                # Convertir a RGBA si no lo es para manejar transparencia
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                
                # Crear nueva imagen con las dimensiones especificadas
                new_img = Image.new('RGBA', (int(width), int(height)), (0, 0, 0, 0))
                
                # Redimensionar manteniendo proporción
                img.thumbnail((int(width), int(height)), Image.Resampling.LANCZOS)
                
                # Centrar la imagen
                x = (int(width) - img.width) // 2
                y = (int(height) - img.height) // 2
                new_img.paste(img, (x, y), img)
                
                new_img.save(output_path, 'PNG', optimize=True)
            return True
        except Exception as e:
            print(f"Error redimensionando: {str(e)}")
            return False
    
    def optimize_image_weight(self, image_path):
        """Optimiza el peso de la imagen usando oxipng"""
        try:
            # Primero optimizar con PIL
            with Image.open(image_path) as img:
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                img.save(image_path, 'PNG', optimize=True, compress_level=6)
            
            # Luego con oxipng para mayor compresión
            optimize(image_path, level=3)
            return True
        except Exception as e:
            print(f"Error optimizando peso: {str(e)}")
            return False
    
    def process_single_image(self, image_path, session_id, settings):
        """Procesa una sola imagen según la configuración"""
        filename = os.path.basename(image_path)
        name_without_ext = os.path.splitext(filename)[0]
        
        # Información original
        original_info = self.get_image_info(image_path)
        if not original_info:
            return None
        
        # Rutas temporales y de salida
        temp_path = os.path.join(tempfile.gettempdir(), f"temp_{session_id}_{filename}")
        output_path = os.path.join(OUTPUT_FOLDER, session_id, f"{name_without_ext}_processed.png")
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Copiar imagen original para procesamiento
        shutil.copy2(image_path, temp_path)
        current_path = temp_path
        
        try:
            # Procesar según switches activados
            if settings.get('remove_background', False):
                bg_removed_path = os.path.join(tempfile.gettempdir(), f"nobg_{session_id}_{filename}")
                if self.remove_background(current_path, bg_removed_path):
                    if current_path != temp_path:
                        os.remove(current_path)
                    current_path = bg_removed_path
                else:
                    raise Exception("Error eliminando fondo")
            
            if settings.get('resize', False):
                width = settings.get('width', 600)
                height = settings.get('height', 600)
                resized_path = os.path.join(tempfile.gettempdir(), f"resized_{session_id}_{filename}")
                
                if self.resize_image(current_path, resized_path, width, height):
                    if current_path != temp_path:
                        os.remove(current_path)
                    current_path = resized_path
                else:
                    raise Exception("Error redimensionando")
            
            # Mover resultado final y optimizar
            shutil.move(current_path, output_path)
            self.optimize_image_weight(output_path)
            
            # Información final
            final_info = self.get_image_info(output_path)
            
            # Calcular porcentaje de reducción
            weight_reduction = 0
            if original_info['size'] > 0:
                weight_reduction = round(((original_info['size'] - final_info['size']) / original_info['size']) * 100)
            
            return {
                'filename': f"{name_without_ext}_processed.png",
                'original_size': original_info['size'],
                'final_size': final_info['size'],
                'weight_reduction': weight_reduction,
                'dimensions': f"{final_info['width']}x{final_info['height']}",
                'path': output_path
            }
            
        except Exception as e:
            # Limpiar archivos temporales
            for path in [temp_path, current_path]:
                if os.path.exists(path):
                    os.remove(path)
            print(f"Error procesando {filename}: {str(e)}")
            return None

# Instancia del procesador
processor = ImageProcessor()

@app.route('/api/upload', methods=['POST'])
def upload_files():
    """Endpoint para subir archivos (imágenes o ZIP)"""
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No se encontraron archivos'}), 400
        
        files = request.files.getlist('files')
        session_id = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        session_folder = os.path.join(UPLOAD_FOLDER, session_id)
        os.makedirs(session_folder, exist_ok=True)
        
        uploaded_images = []
        
        for file in files:
            if file.filename == '':
                continue
                
            filename = secure_filename(file.filename)
            file_path = os.path.join(session_folder, filename)
            file.save(file_path)
            
            # Verificar si es ZIP o imagen
            if filename.lower().endswith('.zip'):
                # Extraer imágenes del ZIP
                extracted_images = processor.extract_images_from_zip(file_path, session_folder)
                for img_path in extracted_images:
                    img_info = processor.get_image_info(img_path)
                    if img_info:
                        uploaded_images.append({
                            'filename': os.path.basename(img_path),
                            'size': img_info['size'],
                            'dimensions': f"{img_info['width']}x{img_info['height']}",
                            'path': img_path
                        })
                # Eliminar ZIP después de extraer
                os.remove(file_path)
            else:
                # Es una imagen individual
                if processor.allowed_file(filename):
                    img_info = processor.get_image_info(file_path)
                    if img_info:
                        uploaded_images.append({
                            'filename': filename,
                            'size': img_info['size'],
                            'dimensions': f"{img_info['width']}x{img_info['height']}",
                            'path': file_path
                        })
        
        return jsonify({
            'session_id': session_id,
            'images': uploaded_images,
            'total_images': len(uploaded_images)
        })
        
    except Exception as e:
        return jsonify({'error': f'Error subiendo archivos: {str(e)}'}), 500

@app.route('/api/process', methods=['POST'])
def process_images():
    """Endpoint para procesar imágenes"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        settings = data.get('settings', {})
        
        if not session_id:
            return jsonify({'error': 'session_id requerido'}), 400
        
        session_folder = os.path.join(UPLOAD_FOLDER, session_id)
        if not os.path.exists(session_folder):
            return jsonify({'error': 'Sesión no encontrada'}), 404
        
        # Obtener todas las imágenes de la sesión
        image_files = []
        for filename in os.listdir(session_folder):
            file_path = os.path.join(session_folder, filename)
            if os.path.isfile(file_path) and processor.allowed_file(filename):
                image_files.append(file_path)
        
        if not image_files:
            return jsonify({'error': 'No se encontraron imágenes para procesar'}), 400
        
        # Procesar imágenes en paralelo
        processed_images = []
        failed_images = []
        
        def process_wrapper(image_path):
            try:
                return processor.process_single_image(image_path, session_id, settings)
            except Exception as e:
                return None
        
        # Usar ThreadPoolExecutor para procesamiento paralelo
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_image = {executor.submit(process_wrapper, img_path): img_path 
                             for img_path in image_files}
            
            for future in as_completed(future_to_image):
                image_path = future_to_image[future]
                try:
                    result = future.result()
                    if result:
                        processed_images.append(result)
                    else:
                        failed_images.append(os.path.basename(image_path))
                except Exception as e:
                    failed_images.append(os.path.basename(image_path))
                    print(f"Error procesando {image_path}: {str(e)}")
        
        return jsonify({
            'session_id': session_id,
            'processed_images': processed_images,
            'failed_images': failed_images,
            'total_processed': len(processed_images),
            'total_failed': len(failed_images)
        })
        
    except Exception as e:
        return jsonify({'error': f'Error procesando imágenes: {str(e)}'}), 500

@app.route('/api/download/<session_id>', methods=['GET'])
def download_images(session_id):
    """Endpoint para descargar imágenes procesadas"""
    try:
        output_folder = os.path.join(OUTPUT_FOLDER, session_id)
        
        if not os.path.exists(output_folder):
            return jsonify({'error': 'No se encontraron imágenes procesadas'}), 404
        
        processed_files = [f for f in os.listdir(output_folder) 
                          if f.endswith('.png')]
        
        if not processed_files:
            return jsonify({'error': 'No hay imágenes procesadas para descargar'}), 404
        
        # Si es solo una imagen, descargar directamente
        if len(processed_files) == 1:
            return send_from_directory(output_folder, processed_files[0], as_attachment=True)
        
        # Si son múltiples imágenes, crear ZIP
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for filename in processed_files:
                file_path = os.path.join(output_folder, filename)
                zip_file.write(file_path, filename)
        
        zip_buffer.seek(0)
        
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f'imagenes_procesadas_{session_id}.zip'
        )
        
    except Exception as e:
        return jsonify({'error': f'Error descargando: {str(e)}'}), 500

@app.route('/api/preview/<session_id>/<filename>')
def preview_image(session_id, filename):
    """Endpoint para preview de imágenes"""
    try:
        # Buscar en carpeta de salida primero
        output_folder = os.path.join(OUTPUT_FOLDER, session_id)
        output_path = os.path.join(output_folder, filename)
        
        if os.path.exists(output_path):
            return send_from_directory(output_folder, filename)
        
        # Buscar en carpeta de subida
        upload_folder = os.path.join(UPLOAD_FOLDER, session_id)
        upload_path = os.path.join(upload_folder, filename)
        
        if os.path.exists(upload_path):
            return send_from_directory(upload_folder, filename)
        
        return jsonify({'error': 'Imagen no encontrada'}), 404
        
    except Exception as e:
        return jsonify({'error': f'Error mostrando imagen: {str(e)}'}), 500

@app.route('/api/cleanup/<session_id>', methods=['DELETE'])
def cleanup_session(session_id):
    """Endpoint para limpiar archivos de una sesión"""
    try:
        # Limpiar carpeta de subida
        upload_folder = os.path.join(UPLOAD_FOLDER, session_id)
        if os.path.exists(upload_folder):
            shutil.rmtree(upload_folder)
        
        # Limpiar carpeta de salida
        output_folder = os.path.join(OUTPUT_FOLDER, session_id)
        if os.path.exists(output_folder):
            shutil.rmtree(output_folder)
        
        return jsonify({'message': 'Sesión limpiada exitosamente'})
        
    except Exception as e:
        return jsonify({'error': f'Error limpiando sesión: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificación de salud del servidor"""
    return jsonify({
        'status': 'ok',
        'message': 'Servidor funcionando correctamente',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Iniciando servidor Image Processor...")
    print("📡 Servidor disponible en: http://localhost:5000")
    print("🔍 Health check: http://localhost:5000/api/health")
    app.run(debug=True, host='0.0.0.0', port=5000)