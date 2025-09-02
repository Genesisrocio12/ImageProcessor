from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
import zipfile
from datetime import datetime
from rembg import remove
from PIL import Image
import base64
import tempfile
import shutil
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import json

app = Flask(__name__)
CORS(app)  # Permitir CORS para el frontend

class ImageProcessor:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        self.supported_formats = {
            'JPEG': ['.jpg', '.jpeg'],
            'PNG': ['.png'],
            'GIF': ['.gif'],
            'WEBP': ['.webp'],
            'BMP': ['.bmp'],
            'TIFF': ['.tiff', '.tif'],
            'RAW': ['.raw', '.cr2', '.nef', '.arw', '.dng'],
            'SVG': ['.svg'],
            'EPS': ['.eps'],
            'AI': ['.ai'],
            'HEIC': ['.heic'],
            'HEIF': ['.heif'],
            'PSD': ['.psd']
        }
    
    def is_supported_format(self, filename):
        """Verifica si el archivo tiene un formato soportado"""
        ext = os.path.splitext(filename.lower())[1]
        for format_type, extensions in self.supported_formats.items():
            if ext in extensions:
                return True
        return False
    
    def process_single_image(self, image_data, filename, remove_bg=False, resize=False, width=400, height=400):
        """Procesa una sola imagen según los parámetros especificados"""
        try:
            # Validar formato de archivo
            if not self.is_supported_format(filename):
                return {
                    'success': False,
                    'filename': filename,
                    'error': f'Formato no soportado: {os.path.splitext(filename)[1]}'
                }
            
            # Decodificar imagen base64
            if isinstance(image_data, str) and image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            try:
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
            except Exception as e:
                return {
                    'success': False,
                    'filename': filename,
                    'error': f'Error al decodificar imagen: {str(e)}'
                }
            
            # Obtener tamaño original para estadísticas
            original_size = len(image_bytes)
            
            # Convertir a RGBA si es necesario para preservar transparencia
            if image.mode not in ('RGBA', 'RGB'):
                if image.mode in ('P', 'LA') or 'transparency' in image.info:
                    image = image.convert('RGBA')
                else:
                    image = image.convert('RGB')
            
            # Procesar imagen según switches activados
            processed_image = image
            operations_applied = {
                'background_removed': False,
                'resized': False,
                'dimensions': 'original',
                'optimized': True
            }
            
            # Paso 1: Remover fondo si se solicita
            if remove_bg:
                try:
                    processed_image = self._remove_background_from_image(processed_image)
                    operations_applied['background_removed'] = True
                except Exception as e:
                    return {
                        'success': False,
                        'filename': filename,
                        'error': f'Error al remover fondo: {str(e)}'
                    }
            
            # Paso 2: Redimensionar si se solicita  
            if resize:
                try:
                    processed_image = self._resize_image(processed_image, int(width), int(height))
                    operations_applied['resized'] = True
                    operations_applied['dimensions'] = f"{width}x{height}"
                except Exception as e:
                    return {
                        'success': False,
                        'filename': filename,
                        'error': f'Error al redimensionar: {str(e)}'
                    }
            
            # Paso 3: Optimizar imagen (siempre aplicado)
            try:
                processed_image = self._optimize_image(processed_image)
            except Exception as e:
                return {
                    'success': False,
                    'filename': filename,
                    'error': f'Error al optimizar: {str(e)}'
                }
            
            # Convertir a PNG optimizado para salida
            try:
                buffer = io.BytesIO()
                # Configuraciones de optimización PNG
                processed_image.save(
                    buffer, 
                    format='PNG',
                    optimize=True,
                    compress_level=6  # Balance entre compresión y velocidad
                )
                buffer.seek(0)
                
                # Calcular estadísticas de compresión
                final_size = len(buffer.getvalue())
                compression_ratio = ((original_size - final_size) / original_size) * 100
                
                processed_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                
                return {
                    'success': True,
                    'filename': filename,
                    'processed_image': f"data:image/png;base64,{processed_base64}",
                    'operations': operations_applied,
                    'stats': {
                        'original_size': original_size,
                        'final_size': final_size,
                        'compression_ratio': round(compression_ratio, 1)
                    }
                }
                
            except Exception as e:
                return {
                    'success': False,
                    'filename': filename,
                    'error': f'Error al generar PNG: {str(e)}'
                }
                
        except Exception as e:
            return {
                'success': False,
                'filename': filename,
                'error': f'Error general: {str(e)}'
            }
    
    def _remove_background_from_image(self, image):
        """Remueve el fondo de una imagen PIL usando rembg"""
        # Convertir PIL a bytes
        buffer = io.BytesIO()
        # Guardar como PNG para preservar transparencia
        image.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Usar rembg para remover fondo
        result = remove(buffer.getvalue())
        
        # Convertir resultado de vuelta a PIL
        return Image.open(io.BytesIO(result))
    
    def _resize_image(self, image, width, height):
        """Redimensiona imagen con crop inteligente y preservación de transparencia"""
        # Crear nuevo canvas transparente del tamaño objetivo
        new_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        
        # Calcular la relación de aspecto
        img_ratio = image.width / image.height
        target_ratio = width / height
        
        if img_ratio > target_ratio:
            # Imagen más ancha - ajustar por altura
            new_height = height
            new_width = int(height * img_ratio)
        else:
            # Imagen más alta - ajustar por ancho
            new_width = width
            new_height = int(width / img_ratio)
        
        # Redimensionar imagen manteniendo proporciones
        resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Crop inteligente - centrar la imagen
        if new_width > width:
            # Crop horizontal
            left = (new_width - width) // 2
            resized = resized.crop((left, 0, left + width, new_height))
        
        if new_height > height:
            # Crop vertical
            top = (new_height - height) // 2
            resized = resized.crop((0, top, new_width, top + height))
        
        # Centrar en el canvas final
        x = (width - resized.width) // 2
        y = (height - resized.height) // 2
        new_img.paste(resized, (x, y), resized if resized.mode == 'RGBA' else None)
        
        return new_img
    
    def _optimize_image(self, image):
        """Optimiza imagen para reducir peso manteniendo calidad"""
        # Si la imagen es muy grande, reducir ligeramente la calidad para optimizar peso
        buffer = io.BytesIO()
        
        # Configuraciones de optimización específicas para PNG
        if image.mode == 'RGBA':
            # Para imágenes con transparencia
            image.save(buffer, format='PNG', optimize=True, compress_level=6)
        else:
            # Para imágenes sin transparencia, convertir a RGB puede ser más eficiente
            if image.mode != 'RGB':
                image = image.convert('RGB')
            image.save(buffer, format='PNG', optimize=True, compress_level=6)
        
        buffer.seek(0)
        return Image.open(buffer)
    
    def process_multiple_images(self, images_data, remove_bg=False, resize=False, width=400, height=400):
        """Procesa múltiples imágenes de forma paralela"""
        results = []
        
        # Usar ThreadPoolExecutor para procesamiento paralelo
        with ThreadPoolExecutor(max_workers=5) as executor:
            # Crear futures para cada imagen
            futures = {
                executor.submit(
                    self.process_single_image,
                    img_data['data'],
                    img_data['filename'],
                    remove_bg,
                    resize,
                    width,
                    height
                ): img_data for img_data in images_data
            }
            
            # Recopilar resultados conforme se completan
            for future in as_completed(futures):
                try:
                    result = future.result(timeout=60)  # Timeout de 60 segundos por imagen
                    results.append(result)
                except Exception as e:
                    img_data = futures[future]
                    results.append({
                        'success': False,
                        'filename': img_data['filename'],
                        'error': f'Timeout o error en procesamiento: {str(e)}'
                    })
        
        return results

# Instancia del procesador
processor = ImageProcessor()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint para verificar que el servidor está funcionando"""
    return jsonify({
        'status': 'ok', 
        'message': 'ImageProcessor Server is running',
        'supported_formats': list(processor.supported_formats.keys())
    })

@app.route('/api/process-images', methods=['POST'])
def process_images():
    """Endpoint principal para procesar imágenes"""
    try:
        data = request.get_json()
        
        if not data or 'images' not in data:
            return jsonify({'error': 'No images provided'}), 400
        
        # Validar que hay imágenes
        if len(data['images']) == 0:
            return jsonify({'error': 'Empty images array'}), 400
        
        # Parámetros de procesamiento con valores por defecto
        remove_bg = data.get('removeBackground', False)
        resize = data.get('resize', False)
        width = data.get('width', 400)
        height = data.get('height', 400)
        
        # Validar dimensiones
        try:
            width = int(width)
            height = int(height)
            if width < 1 or height < 1 or width > 4000 or height > 4000:
                return jsonify({'error': 'Dimensiones inválidas (1-4000px)'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Dimensiones deben ser números enteros'}), 400
        
        print(f"Procesando {len(data['images'])} imágenes:")
        print(f"- Remover fondo: {remove_bg}")
        print(f"- Redimensionar: {resize} ({width}x{height})")
        
        # Procesar imágenes (usando procesamiento paralelo para múltiples imágenes)
        if len(data['images']) == 1:
            # Procesamiento individual
            img_data = data['images'][0]
            result = processor.process_single_image(
                img_data.get('data', ''),
                img_data.get('filename', 'unknown.png'),
                remove_bg, resize, width, height
            )
            processed_results = [result]
        else:
            # Procesamiento masivo paralelo
            processed_results = processor.process_multiple_images(
                data['images'], remove_bg, resize, width, height
            )
        
        # Estadísticas del procesamiento
        successful = len([r for r in processed_results if r.get('success', False)])
        failed = len(processed_results) - successful
        
        response_data = {
            'success': True,
            'results': processed_results,
            'stats': {
                'total_processed': len(processed_results),
                'successful': successful,
                'failed': failed,
                'success_rate': round((successful / len(processed_results)) * 100, 1) if processed_results else 0
            }
        }
        
        print(f"Procesamiento completado: {successful}/{len(processed_results)} exitosos")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error en process_images: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@app.route('/api/download-zip', methods=['POST'])
def download_zip():
    """Endpoint para descargar todas las imágenes procesadas en un ZIP"""
    try:
        data = request.get_json()
        
        if not data or 'images' not in data:
            return jsonify({'error': 'No images provided'}), 400
        
        # Filtrar solo imágenes exitosas
        successful_images = [img for img in data['images'] if img.get('success', False)]
        
        if len(successful_images) == 0:
            return jsonify({'error': 'No hay imágenes procesadas exitosamente'}), 400
        
        # Crear archivo ZIP temporal
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zip_file:
            for i, img_data in enumerate(successful_images):
                try:
                    # Obtener nombre de archivo y datos
                    original_filename = img_data.get('filename', f'processed_image_{i}.png')
                    filename = os.path.splitext(original_filename)[0] + '.png'  # Forzar extensión PNG
                    
                    image_base64 = img_data.get('processed_image', '')
                    if image_base64.startswith('data:image'):
                        image_base64 = image_base64.split(',')[1]
                    
                    # Decodificar y agregar al ZIP
                    image_bytes = base64.b64decode(image_base64)
                    zip_file.writestr(filename, image_bytes)
                    
                except Exception as e:
                    print(f"Error agregando {original_filename} al ZIP: {str(e)}")
                    continue
        
        zip_buffer.seek(0)
        
        # Crear nombre único para el archivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        zip_filename = f'processed_images_{timestamp}.zip'
        
        print(f"Enviando ZIP con {len(successful_images)} imágenes: {zip_filename}")
        
        return send_file(
            io.BytesIO(zip_buffer.getvalue()),
            as_attachment=True,
            download_name=zip_filename,
            mimetype='application/zip'
        )
        
    except Exception as e:
        print(f"Error en download_zip: {str(e)}")
        return jsonify({'error': f'Error creando ZIP: {str(e)}'}), 500

@app.route('/api/process-zip', methods=['POST'])
def process_zip():
    """Endpoint para procesar archivos ZIP cargados"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        zip_file = request.files['file']
        
        if zip_file.filename == '' or not zip_file.filename.lower().endswith('.zip'):
            return jsonify({'error': 'Invalid ZIP file'}), 400
        
        # Obtener parámetros de procesamiento
        remove_bg = request.form.get('removeBackground', 'false').lower() == 'true'
        resize = request.form.get('resize', 'false').lower() == 'true'
        
        try:
            width = int(request.form.get('width', 400))
            height = int(request.form.get('height', 400))
        except ValueError:
            return jsonify({'error': 'Invalid dimensions'}), 400
        
        extracted_images = []
        
        # Leer y extraer imágenes del ZIP
        try:
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                for filename in zip_ref.namelist():
                    if not zip_ref.getinfo(filename).is_dir() and processor.is_supported_format(filename):
                        try:
                            # Leer imagen del ZIP
                            image_data = zip_ref.read(filename)
                            image_base64 = base64.b64encode(image_data).decode('utf-8')
                            
                            extracted_images.append({
                                'filename': filename,
                                'data': image_base64
                            })
                            
                        except Exception as e:
                            print(f"Error extrayendo {filename}: {str(e)}")
                            continue
        
        except zipfile.BadZipFile:
            return jsonify({'error': 'Archivo ZIP corrupto'}), 400
        
        if len(extracted_images) == 0:
            return jsonify({'error': 'No se encontraron imágenes válidas en el ZIP'}), 400
        
        print(f"Extraídas {len(extracted_images)} imágenes del ZIP")
        
        # Procesar imágenes extraídas
        processed_results = processor.process_multiple_images(
            extracted_images, remove_bg, resize, width, height
        )
        
        # Estadísticas
        successful = len([r for r in processed_results if r.get('success', False)])
        
        return jsonify({
            'success': True,
            'results': processed_results,
            'stats': {
                'total_extracted': len(extracted_images),
                'total_processed': len(processed_results),
                'successful': successful,
                'failed': len(processed_results) - successful
            }
        })
        
    except Exception as e:
        print(f"Error en process_zip: {str(e)}")
        return jsonify({'error': f'Error procesando ZIP: {str(e)}'}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'Archivo demasiado grande'}), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Error interno del servidor'}), 500

if __name__ == '__main__':
    # Configurar límite de tamaño de archivo (100MB)
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
    
    # Crear carpetas necesarias
    os.makedirs('temp', exist_ok=True)
    
    print("=" * 50)
    print(" IMAGEPROCESSOR SERVER")
    print("=" * 50)
    print(" Servidor iniciando...")
    print(" Backend corriendo en: http://localhost:5000")
    print(" Frontend esperado en: http://localhost:5173")
    print(" CORS habilitado para desarrollo")
    print(" Formatos soportados:", ", ".join(processor.supported_formats.keys()))
    print(" Procesamiento paralelo habilitado")
    print(" Soporte completo para archivos ZIP")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)